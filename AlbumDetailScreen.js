// AlbumDetailScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAudio } from './src/services/AudioContext';

const { width } = Dimensions.get('window');

const defaultAlbumTracks = [
  { id: 'alb_1', number: '1', title: 'Midnight City', duration: '3:45', artist: 'Digital Horizon', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'alb_2', number: '2', title: 'Sunset Vibes', duration: '3:12', artist: 'Digital Horizon', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'alb_3', number: '3', title: 'Neon Horizon', duration: '4:02', artist: 'Digital Horizon', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'alb_4', number: '4', title: 'Night Drive', duration: '2:58', artist: 'Digital Horizon', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'alb_5', number: '5', title: 'Echoes of Rain', duration: '3:30', artist: 'Digital Horizon', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'alb_6', number: '6', title: 'Electric Skyline', duration: '4:15', artist: 'Digital Horizon', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function AlbumDetailScreen({ album, onClose, onOpenPlayer }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const audioContext = useAudio?.() || {};
  const activeTrack = audioContext.currentTrack;
  const activeIsPlaying = audioContext.isPlaying || false;
  const handleTogglePlay = audioContext.togglePlay;
  const handleNextTrack = audioContext.nextTrack;
  const playTrack = audioContext.playTrack;

  const title = album?.title || 'Плейлист дня';
  const coverUri = album?.cover || 'https://picsum.photos/seed/playlist1/400/400';
  const subtitle = album?.subtitle || 'Персональная подборка с вашего сервера';

  const albumTracks = defaultAlbumTracks.map((t) => ({
    ...t,
    cover: coverUri,
    isLocal: isDownloaded,
  }));

  const handlePlayAlbum = (shuffle = false) => {
    const list = shuffle
      ? [...albumTracks].sort(() => Math.random() - 0.5)
      : albumTracks;
    playTrack?.(list[0], list);
    onOpenPlayer?.(list[0]);
  };

  const handleSelectTrack = (track) => {
    playTrack?.(track, albumTracks);
    onOpenPlayer?.(track);
  };

  const handleDownloadAlbum = () => {
    if (isDownloaded) {
      setIsDownloaded(false);
      return;
    }
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setIsDownloaded(true);
    }, 1000);
  };

  const progressPercent =
    audioContext.duration > 0
      ? `${Math.min((audioContext.position / audioContext.duration) * 100, 100)}%`
      : '45%';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Верхняя навигация */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{title}</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="more-vertical" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={albumTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            <Image source={{ uri: coverUri }} style={styles.albumCover} />

            <Text style={styles.albumTitle}>{title}</Text>
            <Text style={styles.albumSubtitle}>{subtitle}</Text>
            <Text style={styles.albumMeta}>
              6 треков • 21 мин • {isDownloaded ? 'Скачано в память' : 'FLAC Stream'}
            </Text>

            <View style={styles.actionRow}>
              <View style={styles.leftActions}>
                <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.circleActionBtn}>
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isLiked ? '#fc3f1d' : '#FFFFFF'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDownloadAlbum}
                  style={[styles.circleActionBtn, isDownloaded && styles.downloadedBtn]}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="#fc3f1d" />
                  ) : (
                    <Ionicons
                      name={isDownloaded ? 'checkmark-done' : 'download-outline'}
                      size={22}
                      color={isDownloaded ? '#4CAF50' : '#FFFFFF'}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.playbackButtons}>
                <TouchableOpacity
                  style={styles.shuffleButton}
                  onPress={() => handlePlayAlbum(true)}
                >
                  <Ionicons name="shuffle" size={20} color="#FFFFFF" />
                  <Text style={styles.shuffleText}>Перемешать</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playAllButton}
                  onPress={() => handlePlayAlbum(false)}
                >
                  <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
                  <Text style={styles.playAllText}>Слушать</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isCurrent = activeTrack?.id === item.id;
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleSelectTrack(item)}
              style={styles.trackRow}
            >
              {isCurrent ? (
                <Ionicons name="volume-high" size={18} color="#fc3f1d" style={{ width: 24 }} />
              ) : (
                <Text style={styles.trackNumber}>{item.number}</Text>
              )}
              <View style={styles.trackInfo}>
                <Text
                  style={[styles.trackTitle, isCurrent && { color: '#fc3f1d' }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <View style={styles.artistRow}>
                  {isDownloaded && (
                    <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                  )}
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {item.artist}
                  </Text>
                </View>
              </View>
              <Text style={styles.trackDuration}>{item.duration}</Text>
              <TouchableOpacity style={styles.trackMenuBtn}>
                <Feather name="more-horizontal" size={18} color="#6E6A6C" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />

      {/* Мини-плеер */}
      {activeTrack && (
        <TouchableOpacity activeOpacity={0.9} onPress={onOpenPlayer} style={styles.miniPlayer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: progressPercent }]} />
          </View>

          <View style={styles.miniPlayerContent}>
            <Image
              source={{ uri: activeTrack.cover || coverUri }}
              style={styles.playerCover}
            />
            <View style={styles.playerMeta}>
              <Text style={styles.playerTrack} numberOfLines={1}>
                {activeTrack.title}
              </Text>
              <Text style={styles.playerArtist} numberOfLines={1}>
                {activeTrack.artist}
              </Text>
            </View>
            <View style={styles.playerControls}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleTogglePlay?.();
                }}
              >
                <Ionicons
                  name={activeIsPlaying ? 'pause' : 'play'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleNextTrack?.();
                }}
              >
                <Ionicons name="play-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0E0E' },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    maxWidth: '70%',
  },
  iconBtn: { padding: 6 },
  listContent: { paddingBottom: 100 },
  headerComponent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#202022',
    marginBottom: 8,
  },
  albumCover: {
    width: width * 0.52,
    height: width * 0.52,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#202020',
  },
  albumTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  albumSubtitle: {
    fontSize: 13,
    color: '#A0A0A0',
    marginTop: 4,
    textAlign: 'center',
  },
  albumMeta: { fontSize: 12, color: '#6E6A6C', marginTop: 4 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 10,
  },
  circleActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadedBtn: {
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  playbackButtons: { flexDirection: 'row', gap: 10 },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242426',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    gap: 6,
  },
  shuffleText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fc3f1d',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    gap: 6,
  },
  playAllText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  trackNumber: { color: '#6E6A6C', fontSize: 14, fontWeight: '500', width: 24 },
  trackInfo: { flex: 1, marginLeft: 8 },
  trackTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  artistRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  trackArtist: { color: '#8E8E93', fontSize: 12 },
  trackDuration: { color: '#6E6A6C', fontSize: 12, marginRight: 10 },
  trackMenuBtn: { padding: 4 },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 0.5,
    borderTopColor: '#2C2C2E',
  },
  progressBarBg: { height: 2, backgroundColor: '#3A3A3C', width: '100%' },
  progressBarFill: { height: '100%', backgroundColor: '#fc3f1d' },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
  },
  playerCover: { width: 36, height: 36, borderRadius: 4 },
  playerMeta: { flex: 1, marginLeft: 12 },
  playerTrack: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  playerArtist: { color: '#8E8E93', fontSize: 11, marginTop: 1 },
  playerControls: { flexDirection: 'row', alignItems: 'center', gap: 18 },
});