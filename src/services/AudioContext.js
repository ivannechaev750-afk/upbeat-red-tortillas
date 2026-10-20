import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createAudioPlayer } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { StorageService } from '../services/storageService'; // Сервис хранения данных

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0); // в секундах
  const [duration, setDuration] = useState(0); // в секундах
  const [queue, setQueue] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);

  // Ссылка на нативный инстанс плеера
  const playerRef = useRef(null);
  // Интервал для обновления текущего времени
  const progressTimerRef = useRef(null);

  // Загрузка сохраненных треков при старте приложения
  useEffect(() => {
    (async () => {
      const savedTracks = await StorageService.getTracks();
      if (savedTracks && savedTracks.length > 0) {
        setQueue(savedTracks);
        // Загружаем первый трек в буфер без автозапуска
        setCurrentTrack(savedTracks[0]);
        setCurrentTrackIndex(0);
      }
    })();

    return () => {
      stopProgressTimer();
      if (playerRef.current) {
        playerRef.current.release();
      }
    };
  }, []);

  const startProgressTimer = () => {
    stopProgressTimer();
    progressTimerRef.current = setInterval(() => {
      if (playerRef.current) {
        const curTime = playerRef.current.currentTime || 0;
        const totalTime = playerRef.current.duration || 0;
        setPosition(Math.floor(curTime));
        setDuration(Math.floor(totalTime));

        // Если трек доиграл до конца — переходим к следующему
        if (totalTime > 0 && curTime >= totalTime) {
          nextTrack();
        }
      }
    }, 500);
  };

  const stopProgressTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  // 1. Воспроизведение конкретного трека
  const playTrack = async (track, newQueue = null) => {
    try {
      if (!track || !track.uri) return;

      if (newQueue) {
        setQueue(newQueue);
        const idx = newQueue.findIndex((t) => t.id === track.id);
        setCurrentTrackIndex(idx !== -1 ? idx : 0);
      } else {
        const idx = queue.findIndex((t) => t.id === track.id);
        if (idx !== -1) setCurrentTrackIndex(idx);
      }

      setCurrentTrack(track);

      // Очистка старого плеера
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.release();
      }

      // Инициализация аудиопотока
      const player = createAudioPlayer({ uri: track.uri });
      playerRef.current = player;

      player.play();
      setIsPlaying(true);
      startProgressTimer();

      // Сохраняем состояние последней сессии
      StorageService.saveLastSession(track.id, 0);
    } catch (error) {
      console.error('Ошибка воспроизведения аудио:', error);
    }
  };

  // 2. Пауза / Возобновление
  const togglePlay = () => {
    if (!playerRef.current) {
      if (currentTrack) {
        playTrack(currentTrack);
      }
      return;
    }

    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
      stopProgressTimer();
    } else {
      playerRef.current.play();
      setIsPlaying(true);
      startProgressTimer();
    }
  };

  // 3. Перемотка
  const seek = (seconds) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds);
      setPosition(seconds);
    }
  };

  // 4. Следующий трек
  const nextTrack = () => {
    if (queue.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % queue.length;
    playTrack(queue[nextIdx]);
  };

  // 5. Предыдущий трек
  const prevTrack = () => {
    if (queue.length === 0) return;
    // Если трек играет дольше 3 секунд, сначала скидываем в начало
    if (position > 3) {
      seek(0);
      return;
    }
    const prevIdx = (currentTrackIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIdx]);
  };

  // 6. Импорт файлов из памяти устройства через DocumentPicker
  const importLocalTracks = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return [];
      }

      const imported = result.assets.map((asset, index) => {
        const rawName = asset.name || 'Аудиозапись';
        const cleanTitle = rawName.replace(/\.[^/.]+$/, '');

        return {
          id: `local_${Date.now()}_${index}`,
          title: cleanTitle,
          artist: 'Память телефона',
          uri: asset.uri, // file:///...
          cover: 'https://picsum.photos/seed/' + encodeURIComponent(cleanTitle) + '/200/200',
          durationSec: 0,
          isLocal: true,
          liked: false,
        };
      });

      const updatedQueue = [...imported, ...queue];
      setQueue(updatedQueue);
      await StorageService.saveTracks(updatedQueue);

      return imported;
    } catch (error) {
      console.error('Ошибка выбора файлов:', error);
      return [];
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        position,
        duration,
        queue,
        playTrack,
        togglePlay,
        seek,
        nextTrack,
        prevTrack,
        importLocalTracks,
        setQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);