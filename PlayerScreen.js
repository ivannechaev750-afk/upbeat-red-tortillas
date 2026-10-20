import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudio } from './src/services/AudioContext';

const { width } = Dimensions.get('window');
const COVER_SIZE = width - 48;

export default function PlayerScreen({ 
  track: propTrack, 
  isPlaying: propPlaying, 
  onTogglePlay: propTogglePlay, 
  onClose, 
  onOpenQueue 
}) {
  // Получаем глобальные данные и методы воспроизведения из AudioContext
  const audioContext = useAudio?.() || {};
  const activeTrack = audioContext.currentTrack || propTrack;
  const activeIsPlaying = audioContext.isPlaying !== undefined ? audioContext.isPlaying : propPlaying;
  const handleTogglePlay = audioContext.togglePlay || propTogglePlay;
  const handleNextTrack = audioContext.nextTrack;
  const handlePrevTrack = audioContext.prevTrack;
  const handleSeek = audioContext.seek;

  const position = audioContext.position || 0;
  const duration = audioContext.duration || 0;

  const [isLiked, setIsLiked] = useState(activeTrack?.liked || false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Форматирование секунд в формат ММ:СС
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Расчет процента заполнения дорожки
  const progressRatio = duration > 0 ? Math.min(position / duration, 1) : 0;
  const progressPercent = `${progressRatio * 100}%`;

  // Интерактивная перемотка по клику на прогресс-бар
  const handleProgressBarPress = (e) => {
    if (!handleSeek || duration <= 0) return;
    const clickX = e.nativeEvent.locationX;
    const barWidth = width - 48; // ширина контейнера progressContainer
    const targetRatio = Math.max(0, Math.min(clickX / barWidth, 1));
    handleSeek(Math.floor(targetRatio * duration));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Верхняя строка с кнопкой закрытия */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
          <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Моя волна</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="more-horizontal" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Обложка */}
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: activeTrack?.cover || 'https://picsum.photos/seed/sunset/600/600' }}
          style={styles.coverImage}
        />
      </View>

      {/* Название и лайк */}
      <View style={styles.metaContainer}>
        <View style={styles.titleWrapper}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {activeTrack?.title || 'Нет трека'}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {activeTrack?.artist || '—'}
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

      {/* Прогресс-бар с интерактивной перемоткой */}
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
          <Text style={styles.timeText}>{duration > 0 ? formatTime(duration) : (activeTrack?.duration || '0:00')}</Text>
        </View>
      </View>

      {/* Управление */}
      <View style={styles.mainControls}>
        <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)} style={styles.controlBtn}>
          <Ionicons 
            name="shuffle" 
            size={22} 
            color={isShuffle ? '#fc3f1d' : '#8E8E93'} 
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePrevTrack} style={styles.controlBtn}>
          <Ionicons name="play-skip-back" size={26} color="#FFFFFF" />
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
          <Ionicons name="play-skip-forward" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRepeat(!isRepeat)} style={styles.controlBtn}>
          <Ionicons 
            name="repeat" 
            size={22} 
            color={isRepeat ? '#fc3f1d' : '#8E8E93'} 
          />
        </TouchableOpacity>
      </View>

      {/* Текст и Очередь */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="chat-bubble-outline" size={22} color="#8E8E93" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenQueue} style={[styles.iconBtn, styles.bottomBtn]}>
          <MaterialCommunityIcons name="playlist-music-outline" size={26} color="#FFFFFF" />
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
    paddingHorizontal: 24 
  },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 8, 
    height: 48 
  },
  iconBtn: {
    padding: 6,
  },
  headerTitle: { 
    color: '#E0E0E0', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  coverContainer: { 
    alignItems: 'center', 
    marginVertical: 14 
  },
  coverImage: { 
    width: COVER_SIZE, 
    height: COVER_SIZE, 
    borderRadius: 20,
    backgroundColor: '#262224' 
  },
  metaContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  titleWrapper: { 
    flex: 1, 
    marginRight: 16 
  },
  trackTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#FFFFFF' 
  },
  artistName: { 
    fontSize: 16, 
    color: '#8E8E93', 
    marginTop: 4 
  },
  progressContainer: { 
    marginVertical: 12 
  },
  progressTouchArea: {
    paddingVertical: 10,
    justifyContent: 'center',
  },
  progressBarTrack: { 
    height: 4, 
    backgroundColor: '#383335', 
    borderRadius: 2, 
    position: 'relative', 
    justifyContent: 'center' 
  },
  progressBarFill: { 
    height: '100%', 
    backgroundColor: '#fc3f1d', 
    borderRadius: 2 
  },
  progressThumb: { 
    position: 'absolute', 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    backgroundColor: '#fc3f1d', 
    marginLeft: -7 
  },
  timeLabels: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 2 
  },
  timeText: { 
    color: '#6E6A6C', 
    fontSize: 12 
  },
  mainControls: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 6 
  },
  controlBtn: {
    padding: 8,
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
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingBottom: 16 
  },
  bottomBtn: {
    padding: 8,
  },
});