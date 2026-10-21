// PlayerScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Ionicons,
  Feather,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useAudio } from './src/services/AudioContext';

const { width } = Dimensions.get('window');
const COVER_SIZE = width - 56;

const sampleLyrics = [
  'Ночной проспект в неоновых огнях,',
  'Мы ловим ритм на частоте волны,',
  'Сквозь шум дождя и цифровой туман,',
  'Звучит мелодия из глубины тишины...',
  '♪ Инструментальный проигрыш ♪',
  'Сервер хранит забытые аккорды,',
  'Каждый бит летит сквозь провода.',
];

export default function PlayerScreen({
  track: propTrack,
  isPlaying: propPlaying,
  onTogglePlay: propTogglePlay,
  onClose,
  onOpenQueue,
}) {
  const audioContext = useAudio?.() || {};
  const activeTrack = audioContext.currentTrack || propTrack;
  const activeIsPlaying =
    audioContext.isPlaying !== undefined ? audioContext.isPlaying : propPlaying;
  const handleTogglePlay = audioContext.togglePlay || propTogglePlay;
  const handleNextTrack = audioContext.nextTrack;
  const handlePrevTrack = audioContext.prevTrack;
  const handleSeek = audioContext.seek;

  const position = audioContext.position || 0;
  const duration = audioContext.duration || 0;

  const [isLiked, setIsLiked] = useState(activeTrack?.liked || false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [showLyrics, setShowLyrics] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null); // null | 15 | 30 | 60
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    setIsLiked(Boolean(activeTrack?.liked));
  }, [activeTrack?.id]);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressRatio = duration > 0 ? Math.min(position / duration, 1) : 0;
  const progressPercent = `${progressRatio * 100}%`;

  const handleProgressBarPress = (e) => {
    if (!handleSeek || duration <= 0) return;
    const clickX = e.nativeEvent.locationX;
    const barWidth = width - 48;
    const targetRatio = Math.max(0, Math.min(clickX / barWidth, 1));
    handleSeek(Math.floor(targetRatio * duration));
  };

  const cycleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const cycleSleepTimer = () => {
    if (!sleepTimer) setSleepTimer(15);
    else if (sleepTimer === 15) setSleepTimer(30);
    else if (sleepTimer === 30) setSleepTimer(60);
    else setSleepTimer(null);
  };

  const cycleSpeed = () => {
    if (playbackSpeed === 1.0) setPlaybackSpeed(1.25);
    else if (playbackSpeed === 1.25) setPlaybackSpeed(1.5);
    else setPlaybackSpeed(1.0);
  };

  const isLocal = activeTrack?.isLocal;
  const audioFormat = activeTrack?.format || 'FLAC • 96kHz';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Верхняя строка */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
          <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isLocal ? 'Из памяти устройства' : 'Поток с медиасервера'}
          </Text>
          <View style={styles.qualityPill}>
            <Ionicons
              name={isLocal ? 'phone-portrait-outline' : 'cloud-done-outline'}
              size={11}
              color="#fc3f1d"
            />
            <Text style={styles.qualityText}>{audioFormat}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={cycleSleepTimer}>
          <Ionicons
            name="moon-outline"
            size={22}
            color={sleepTimer ? '#fc3f1d' : '#FFFFFF'}
          />
          {sleepTimer && <Text style={styles.timerBadge}>{sleepTimer}м</Text>}
        </TouchableOpacity>
      </View>

      {/* Центральная область: Обложка или Текст песни */}
      <View style={styles.coverContainer}>
        {showLyrics ? (
          <View style={[styles.lyricsCard, { width: COVER_SIZE, height: COVER_SIZE }]}>
            <Text style={styles.lyricsHeader}>Текст трека</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {sampleLyrics.map((line, idx) => (
                <Text
                  key={idx}
                  style={[styles.lyricLine, idx === 1 && styles.lyricLineActive]}
                >
                  {line}
                </Text>
              ))}
            </ScrollView>
          </View>
        ) : (
          <Image
            source={{
              uri: activeTrack?.cover || 'https://picsum.photos/seed/sunset/600/600',
            }}
            style={styles.coverImage}
          />
        )}
      </View>

      {/* Название и лайк */}
      <View style={styles.metaContainer}>
        <View style={styles.titleWrapper}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {activeTrack?.title || 'Нет активного трека'}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {activeTrack?.artist || 'Выберите музыку в коллекции'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.iconBtn}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={28}
            color={isLiked ? '#fc3f1d' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* Прогресс-бар */}
      <View style={styles.progressContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleProgressBarPress}
          style={styles.progressTouchArea}
        >
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: progressPercent }]} />
            <View style={[styles.progressThumb, { left: progressPercent }]} />
          </View>
        </TouchableOpacity>
        <View style={styles.timeLabels}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>
            {duration > 0 ? formatTime(duration) : activeTrack?.duration || '0:00'}
          </Text>
        </View>
      </View>

      {/* Основные кнопки управления */}
      <View style={styles.mainControls}>
        <TouchableOpacity
          onPress={() => setIsShuffle(!isShuffle)}
          style={styles.controlBtn}
        >
          <Ionicons
            name="shuffle"
            size={22}
            color={isShuffle ? '#fc3f1d' : '#8E8E93'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePrevTrack} style={styles.controlBtn}>
          <Ionicons name="play-skip-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTogglePlay}
          style={styles.bigPlayButton}
          activeOpacity={0.85}
        >
          <Ionicons
            name={activeIsPlaying ? 'pause' : 'play'}
            size={32}
            color="#FFFFFF"
            style={!activeIsPlaying ? { marginLeft: 3 } : null}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNextTrack} style={styles.controlBtn}>
          <Ionicons name="play-skip-forward" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={cycleRepeat} style={styles.controlBtn}>
          <Ionicons
            name="repeat"
            size={22}
            color={repeatMode !== 'off' ? '#fc3f1d' : '#8E8E93'}
          />
          {repeatMode === 'one' && <Text style={styles.repeatOneBadge}>1</Text>}
        </TouchableOpacity>
      </View>

      {/* Нижняя панель: Текст, Скорость, Очередь */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => setShowLyrics(!showLyrics)}
          style={styles.bottomBtn}
        >
          <MaterialIcons
            name="chat-bubble-outline"
            size={22}
            color={showLyrics ? '#fc3f1d' : '#8E8E93'}
          />
          <Text style={[styles.bottomBtnLabel, showLyrics && { color: '#fc3f1d' }]}>
            Текст
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={cycleSpeed} style={styles.speedPill}>
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenQueue} style={styles.bottomBtn}>
          <MaterialCommunityIcons
            name="playlist-music-outline"
            size={26}
            color="#FFFFFF"
          />
          <Text style={styles.bottomBtnLabel}>Очередь</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161314',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    height: 54,
  },
  iconBtn: { padding: 6, alignItems: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: '#E0E0E0', fontSize: 13, fontWeight: '600' },
  qualityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#262022',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 3,
  },
  qualityText: { color: '#fc3f1d', fontSize: 10, fontWeight: '700' },
  timerBadge: { color: '#fc3f1d', fontSize: 9, fontWeight: '700', marginTop: -2 },
  coverContainer: { alignItems: 'center', marginVertical: 10 },
  coverImage: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 20,
    backgroundColor: '#262224',
  },
  lyricsCard: {
    backgroundColor: '#221D1F',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#332B2E',
  },
  lyricsHeader: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  lyricLine: {
    color: '#7A7577',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    lineHeight: 24,
  },
  lyricLineActive: { color: '#FFFFFF', fontSize: 20 },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrapper: { flex: 1, marginRight: 16 },
  trackTitle: { fontSize: 23, fontWeight: '800', color: '#FFFFFF' },
  artistName: { fontSize: 15, color: '#8E8E93', marginTop: 4 },
  progressContainer: { marginVertical: 8 },
  progressTouchArea: { paddingVertical: 10, justifyContent: 'center' },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#383335',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: { height: '100%', backgroundColor: '#fc3f1d', borderRadius: 2 },
  progressThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fc3f1d',
    marginLeft: -7,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  timeText: { color: '#6E6A6C', fontSize: 12 },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  controlBtn: { padding: 8, position: 'relative' },
  repeatOneBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 9,
    fontWeight: '800',
    color: '#fc3f1d',
  },
  bigPlayButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fc3f1d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fc3f1d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    paddingHorizontal: 12,
  },
  bottomBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 },
  bottomBtnLabel: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  speedPill: {
    backgroundColor: '#262224',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  speedText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});