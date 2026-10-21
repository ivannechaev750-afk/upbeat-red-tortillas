// src/services/AudioContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { StorageService } from './storageService';
import {
  pickLocalAudioFiles,
  scanDeviceMusicLibrary,
  requestAudioPermissions,
  normalizeTrack,
} from './fileService';
import { audioEngine } from './audioService';

export const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueueState] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);

  // Состояния режимов плеера и разрешений
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const queueRef = useRef([]);
  const indexRef = useRef(-1);
  const repeatRef = useRef('off');
  const shuffleRef = useRef(false);
  const progressTimerRef = useRef(null);
  const isTransitioningRef = useRef(false);

  const setQueue = useCallback((newQueue) => {
    const normalized = Array.isArray(newQueue)
      ? newQueue.map((t, idx) => normalizeTrack(t, idx))
      : [];
    queueRef.current = normalized;
    setQueueState(normalized);
  }, []);

  useEffect(() => {
    repeatRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    shuffleRef.current = isShuffle;
  }, [isShuffle]);

  // Загрузка сохраненных треков при запуске
  useEffect(() => {
    let mounted = true;

    (async () => {
      await audioEngine.setupPlayer();
      const [savedTracks, lastSession] = await Promise.all([
        StorageService.getTracks(),
        StorageService.getLastSession(),
      ]);

      if (!mounted) return;

      if (savedTracks && savedTracks.length > 0) {
        setQueue(savedTracks);

        let startIdx = 0;
        if (lastSession?.trackId) {
          const foundIdx = savedTracks.findIndex((t) => t.id === lastSession.trackId);
          if (foundIdx !== -1) startIdx = foundIdx;
        }

        setCurrentTrack(savedTracks[startIdx]);
        setCurrentTrackIndex(startIdx);
        indexRef.current = startIdx;
      }
    })();

    return () => {
      mounted = false;
      stopProgressTimer();
      audioEngine.release();
    };
  }, [setQueue]);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    progressTimerRef.current = setInterval(async () => {
      const { position: curTime, duration: totalTime } = await audioEngine.getProgress();
      const posSec = Math.floor(curTime);
      const durSec = Math.floor(totalTime);

      setPosition(posSec);
      if (durSec > 0) setDuration(durSec);

      if (durSec > 0 && curTime >= totalTime - 0.35 && !isTransitioningRef.current) {
        isTransitioningRef.current = true;
        handleTrackEnded();
      }
    }, 500);
  }, [stopProgressTimer]);

  const handleTrackEnded = async () => {
    const activeQueue = queueRef.current;
    const curIdx = indexRef.current;

    if (activeQueue.length === 0) {
      isTransitioningRef.current = false;
      return;
    }

    if (repeatRef.current === 'one') {
      await audioEngine.seekTo(0);
      await audioEngine.play();
      setPosition(0);
      isTransitioningRef.current = false;
      return;
    }

    let nextIdx;
    if (shuffleRef.current && activeQueue.length > 1) {
      do {
        nextIdx = Math.floor(Math.random() * activeQueue.length);
      } while (nextIdx === curIdx);
    } else {
      nextIdx = curIdx + 1;
    }

    if (nextIdx >= activeQueue.length) {
      if (repeatRef.current === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        stopProgressTimer();
        isTransitioningRef.current = false;
        return;
      }
    }

    await playTrack(activeQueue[nextIdx]);
    isTransitioningRef.current = false;
  };

  // 1. Воспроизведение конкретного трека
  const playTrack = useCallback(
    async (track, newQueue = null) => {
      try {
        if (!track) return;
        const normalizedTrack = normalizeTrack(track);
        if (!normalizedTrack.uri) return;

        let activeList = queueRef.current;
        if (Array.isArray(newQueue) && newQueue.length > 0) {
          setQueue(newQueue);
          activeList = queueRef.current;
        }

        const idx = activeList.findIndex((t) => t.id === normalizedTrack.id);
        const resolvedIdx = idx !== -1 ? idx : 0;

        setCurrentTrackIndex(resolvedIdx);
        indexRef.current = resolvedIdx;
        setCurrentTrack(normalizedTrack);
        setPosition(0);
        setDuration(normalizedTrack.durationSec || 0);

        const started = await audioEngine.loadAndPlay(normalizedTrack);
        if (started) {
          setIsPlaying(true);
          startProgressTimer();
        }

        StorageService.saveLastSession(normalizedTrack.id, 0);
      } catch (error) {
        console.error('Ошибка воспроизведения файла:', error);
      }
    },
    [setQueue, startProgressTimer]
  );

  // 2. Пауза / Возобновление
  const togglePlay = useCallback(async () => {
    if (!currentTrack) {
      if (queueRef.current.length > 0) {
        await playTrack(queueRef.current[0]);
      }
      return;
    }

    if (isPlaying) {
      await audioEngine.pause();
      setIsPlaying(false);
      stopProgressTimer();
      StorageService.saveLastSession(currentTrack.id, position);
    } else {
      const { duration: d } = await audioEngine.getProgress();
      if (!d || d === 0) {
        await playTrack(currentTrack);
      } else {
        await audioEngine.play();
        setIsPlaying(true);
        startProgressTimer();
      }
    }
  }, [currentTrack, isPlaying, playTrack, position, startProgressTimer, stopProgressTimer]);

  // 3. Перемотка
  const seek = useCallback(async (seconds) => {
    const target = Math.max(0, Math.floor(seconds));
    await audioEngine.seekTo(target);
    setPosition(target);
  }, []);

  // 4. Следующий трек
  const nextTrack = useCallback(() => {
    const activeQueue = queueRef.current;
    if (activeQueue.length === 0) return;

    let nextIdx;
    if (shuffleRef.current && activeQueue.length > 1) {
      nextIdx = Math.floor(Math.random() * activeQueue.length);
    } else {
      nextIdx = (indexRef.current + 1) % activeQueue.length;
    }
    playTrack(activeQueue[nextIdx]);
  }, [playTrack]);

  // 5. Предыдущий трек
  const prevTrack = useCallback(() => {
    const activeQueue = queueRef.current;
    if (activeQueue.length === 0) return;

    if (position > 3) {
      seek(0);
      return;
    }
    const prevIdx = (indexRef.current - 1 + activeQueue.length) % activeQueue.length;
    playTrack(activeQueue[prevIdx]);
  }, [playTrack, position, seek]);

  // 6. Запрос разрешения на чтение памяти устройства
  const askMediaPermission = useCallback(async () => {
    const res = await requestAudioPermissions();
    setPermissionGranted(res.granted);
    return res;
  }, []);

  // 7. Выбор аудиофайлов через системный проводник
  const importLocalTracks = useCallback(
    async (onProgress) => {
      const imported = await pickLocalAudioFiles(onProgress);
      if (!imported || imported.length === 0) return [];

      const merged = await StorageService.upsertTracks(imported);
      setQueue(merged);

      // Если до импорта ничего не было выбрано — ставим первый трек готовым к запуску
      if (!currentTrack && merged.length > 0) {
        setCurrentTrack(merged[0]);
        setCurrentTrackIndex(0);
        indexRef.current = 0;
      }

      return imported;
    },
    [currentTrack, setQueue]
  );

  // 8. Полное сканирование памяти телефона с запросом разрешения
  const scanPhoneMusic = useCallback(
    async (onProgress) => {
      const scanned = await scanDeviceMusicLibrary(onProgress);
      setPermissionGranted(true);
      if (!scanned || scanned.length === 0) return [];

      const merged = await StorageService.upsertTracks(scanned);
      setQueue(merged);

      if (!currentTrack && merged.length > 0) {
        setCurrentTrack(merged[0]);
        setCurrentTrackIndex(0);
        indexRef.current = 0;
      }

      return scanned;
    },
    [currentTrack, setQueue]
  );

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        position,
        duration,
        queue,
        isShuffle,
        repeatMode,
        playbackSpeed,
        permissionGranted,
        setIsShuffle,
        setRepeatMode,
        setPlaybackSpeed,
        playTrack,
        togglePlay,
        seek,
        nextTrack,
        prevTrack,
        askMediaPermission,
        importLocalTracks,
        scanPhoneMusic,
        setQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);