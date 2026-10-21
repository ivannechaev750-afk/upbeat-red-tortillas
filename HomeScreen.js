// HomeScreen.js
import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudio } from './src/services/AudioContext';

const { width } = Dimensions.get('window');

const topRowData = [
  { id: 'my_wave', type: 'wave', title: 'Моя волна', bgColor: '#7B1FA2' },
  {
    id: 'daily_playlist',
    type: 'split',
    title: 'Плейлист дня',
    bgColor: '#D32F2F',
    images: [
      'https://picsum.photos/seed/playlist1/150/150',
      'https://picsum.photos/seed/playlist2/150/150',
    ],
  },
  {
    id: 'new_releases',
    type: 'single',
    title: 'Новинки сервера',
    bgColor: '#303F9F',
    image: 'https://picsum.photos/seed/newrel/150/150',
  },
];

const recentlyPlayed = [
  { id: '1', title: 'Synthwave Mix', cover: 'https://picsum.photos/seed/rc1/150/150', isLocal: false },
  { id: '2', title: 'Lo-Fi Beats', cover: 'https://picsum.photos/seed/rc2/150/150', isLocal: true },
  { id: '3', title: 'Night Drive', cover: 'https://picsum.photos/seed/rc3/150/150', isLocal: false },
  { id: '4', title: 'Cyberia', cover: 'https://picsum.photos/seed/rc4/150/150', isLocal: false },
  { id: '5', title: 'Deep Focus', cover: 'https://picsum.photos/seed/rc5/150/150', isLocal: true },
  { id: '6', title: 'Retrowave', cover: 'https://picsum.photos/seed/rc6/150/150', isLocal: false },
  { id: '7', title: 'Ambient Lab', cover: 'https://picsum.photos/seed/rc7/150/150', isLocal: false },
  { id: '8', title: 'FLAC Classics', cover: 'https://picsum.photos/seed/rc8/150/150', isLocal: true },
];

const quickRecommendedTracks = [
  {
    id: 'rec_1',
    title: 'Sunset Vibes',
    artist: 'Digital Horizon',
    cover: 'https://picsum.photos/seed/sunset/150/150',
    isLocal: false,
    format: 'FLAC',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'rec_2',
    title: 'City Lights',
    artist: 'Neon Walker',
    cover: 'https://picsum.photos/seed/track1/150/150',
    isLocal: false,
    format: 'MP3',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'rec_3',
    title: 'Echoes of Rain',
    artist: 'Ambient Lab',
    cover: 'https://picsum.photos/seed/track2/150/150',
    isLocal: true,
    format: 'WAV',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

export default function HomeScreen({
  currentTrack: propTrack,
  isPlaying: propPlaying,
  onTogglePlay: propTogglePlay,
  onOpenPlayer,
  onOpenLibrary,
  onOpenSettings,
  onOpenSearch,
  onOpenAlbum,
}) {
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'server' | 'local'
  const [refreshing, setRefreshing] = useState(false);

  const audioContext = useAudio?.() || {};
  const activeTrack = audioContext.currentTrack || propTrack;
  const activeIsPlaying =
    audioContext.isPlaying !== undefined ? audioContext.isPlaying : propPlaying;
  const handleTogglePlay = audioContext.togglePlay || propTogglePlay;
  const handleNextTrack = audioContext.nextTrack;
  const playTrack = audioContext.playTrack;
  const queue = audioContext.queue?.length > 0 ? audioContext.queue : quickRecommendedTracks;

  const progressPercent = useMemo(() => {
    if (audioContext.duration > 0) {
      const ratio = Math.min(Math.max(audioContext.position / audioContext.duration, 0), 1);
      return `${ratio * 100}%`;
    }
    return '45%';
  }, [audioContext.position, audioContext.duration]);

  const filteredRecent = useMemo(() => {
    if (sourceFilter === 'local') return recentlyPlayed.filter((i) => i.isLocal);
    if (sourceFilter === 'server') return recentlyPlayed.filter((i) => !i.isLocal);
    return recentlyPlayed;
  }, [sourceFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  const handleStartMyWave = () => {
    if (activeTrack) {
      handleTogglePlay?.();
    } else if (playTrack && queue.length > 0) {
      playTrack(queue[0], queue);
    }
    onOpenPlayer?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Шапка */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Главная</Text>
          <TouchableOpacity style={styles.serverBadge} onPress={onOpenSettings} activeOpacity={0.7}>
            <View style={styles.serverDot} />
            <Text style={styles.serverBadgeText}>NAS Server • Онлайн</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={onOpenSearch}>
            <Ionicons name="search-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onOpenSettings}>
            <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fc3f1d" />
        }
      >
        {/* Фильтры источников */}
        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'Все источники', icon: 'layers-outline' },
            { key: 'server', label: 'Стриминг', icon: 'cloud-outline' },
            { key: 'local', label: 'В памяти', icon: 'phone-portrait-outline' },
          ].map((f) => {
            const active = sourceFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setSourceFilter(f.key)}
              >
                <Ionicons
                  name={f.icon}
                  size={14}
                  color={active ? '#FFFFFF' : '#8E8E93'}
                />
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Верхняя карусель */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topRowContainer}
        >
          {topRowData.map((item) => (
            <View key={item.id} style={styles.topCardWrapper}>
              {item.type === 'wave' && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleStartMyWave}
                  style={[styles.topCard, { backgroundColor: item.bgColor }]}
                >
                  <View style={styles.waveIndicator}>
                    <View style={[styles.waveLine, { height: activeIsPlaying ? 16 : 8 }]} />
                    <View style={[styles.waveLine, { height: activeIsPlaying ? 10 : 14 }]} />
                    <View style={[styles.waveLine, { height: activeIsPlaying ? 18 : 10 }]} />
                  </View>
                  <View style={styles.wavePlayButton}>
                    <Ionicons
                      name={activeIsPlaying ? 'pause' : 'play'}
                      size={22}
                      color="#fc3f1d"
                      style={!activeIsPlaying ? { marginLeft: 2 } : null}
                    />
                  </View>
                  <Text style={styles.waveSubtext}>
                    {activeIsPlaying ? 'Играет сейчас' : 'Настроить поток'}
                  </Text>
                </TouchableOpacity>
              )}

              {item.type === 'split' && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    onOpenAlbum?.({
                      title: 'Плейлист дня',
                      cover: item.images[0],
                      subtitle: 'Ежедневная подборка с вашего сервера',
                    })
                  }
                >
                  <View style={[styles.topCard, styles.splitCard, { backgroundColor: item.bgColor }]}>
                    <Text style={styles.splitCardTitle}>{item.title}</Text>
                    <View style={styles.splitImages}>
                      <Image source={{ uri: item.images[0] }} style={styles.halfImage} />
                      <Image source={{ uri: item.images[1] }} style={styles.halfImage} />
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {item.type === 'single' && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    onOpenAlbum?.({
                      title: 'Новинки сервера',
                      cover: item.image,
                      subtitle: 'Свежие релизы с вашего NAS',
                    })
                  }
                >
                  <View style={[styles.topCard, styles.splitCard, { backgroundColor: item.bgColor }]}>
                    <Text style={styles.splitCardTitle}>{item.title}</Text>
                    <View style={styles.singleImageContainer}>
                      <Image source={{ uri: item.image }} style={styles.singleImage} />
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              <Text style={styles.topCardLabel}>{item.title}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Быстрый запуск треков */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Быстрый старт</Text>
            <TouchableOpacity onPress={onOpenLibrary}>
              <Text style={styles.seeAllText}>Все треки</Text>
            </TouchableOpacity>
          </View>
          {queue.slice(0, 3).map((track) => {
            const isCurrent = activeTrack?.id === track.id;
            return (
              <TouchableOpacity
                key={track.id}
                style={[styles.quickTrackRow, isCurrent && styles.quickTrackRowActive]}
                activeOpacity={0.75}
                onPress={() => {
                  playTrack?.(track, queue);
                  onOpenPlayer?.(track);
                }}
              >
                <Image source={{ uri: track.cover }} style={styles.quickTrackCover} />
                <View style={styles.quickTrackInfo}>
                  <Text
                    style={[styles.quickTrackTitle, isCurrent && { color: '#fc3f1d' }]}
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>
                  <View style={styles.quickTrackMeta}>
                    <Ionicons
                      name={track.isLocal ? 'phone-portrait-outline' : 'cloud-outline'}
                      size={12}
                      color="#8E8E93"
                    />
                    <Text style={styles.quickTrackArtist} numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isCurrent && activeIsPlaying ? 'pause-circle' : 'play-circle'}
                  size={28}
                  color={isCurrent ? '#fc3f1d' : '#FFFFFF'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Недавно прослушанное */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Недавно прослушанное</Text>
          <FlatList
            data={filteredRecent}
            keyExtractor={(item) => item.id}
            numColumns={4}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recentItem}
                activeOpacity={0.8}
                onPress={() =>
                  onOpenAlbum?.({
                    title: item.title || `Альбом #${item.id}`,
                    cover: item.cover,
                    subtitle: item.isLocal ? 'Локальный альбом' : 'Треки с сервера',
                  })
                }
              >
                <Image source={{ uri: item.cover }} style={styles.recentCover} />
                <View style={styles.recentSourceBadge}>
                  <Ionicons
                    name={item.isLocal ? 'phone-portrait' : 'cloud'}
                    size={10}
                    color="#FFFFFF"
                  />
                </View>
              </TouchableOpacity>
            )}
            columnWrapperStyle={styles.gridRow}
          />
        </View>
      </ScrollView>

      {/* Мини-плеер внизу экрана */}
      {activeTrack && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onOpenPlayer?.()}
          style={styles.miniPlayer}
        >
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: progressPercent }]} />
          </View>

          <View style={styles.miniPlayerContent}>
            <Image
              source={{
                uri: activeTrack.cover || 'https://picsum.photos/seed/sunset/100/100',
              }}
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
                style={styles.controlIconBtn}
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
                style={styles.controlIconBtn}
              >
                <Ionicons name="play-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Нижняя навигация */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={20} color="#fc3f1d" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Главная</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={onOpenSearch}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <Text style={styles.tabLabel}>Поиск</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={onOpenLibrary}>
          <Feather name="book-open" size={20} color="#8E8E93" />
          <Text style={styles.tabLabel}>Коллекция</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0E0E' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  serverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  serverDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  serverBadgeText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconButton: {
    padding: 8,
    backgroundColor: '#18181A',
    borderRadius: 20,
  },
  scrollContent: { paddingBottom: 150 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#18181A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#262628',
  },
  filterChipActive: {
    backgroundColor: '#fc3f1d',
    borderColor: '#fc3f1d',
  },
  filterChipText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  topRowContainer: { paddingLeft: 16, paddingRight: 8, marginVertical: 16 },
  topCardWrapper: { marginRight: 14, width: 138 },
  topCard: {
    width: 138,
    height: 138,
    borderRadius: 18,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  waveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2.5,
  },
  waveLine: {
    width: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  wavePlayButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  waveSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
  },
  splitCard: { justifyContent: 'space-between', alignItems: 'flex-start' },
  splitCardTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  splitImages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 56,
    gap: 6,
  },
  halfImage: { flex: 1, height: '100%', borderRadius: 8, backgroundColor: '#222' },
  singleImageContainer: { width: '100%', height: 56, alignItems: 'flex-start' },
  singleImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#222' },
  topCardLabel: { color: '#B3B3B3', fontSize: 13, fontWeight: '500', marginTop: 8 },
  section: { paddingHorizontal: 16, marginTop: 10, marginBottom: 14 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 10 },
  seeAllText: { color: '#fc3f1d', fontSize: 13, fontWeight: '600' },
  quickTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161618',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickTrackRowActive: {
    borderWidth: 1,
    borderColor: '#fc3f1d',
  },
  quickTrackCover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  quickTrackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  quickTrackTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickTrackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  quickTrackArtist: {
    color: '#8E8E93',
    fontSize: 12,
  },
  gridRow: { justifyContent: 'flex-start', gap: 10, marginBottom: 10 },
  recentItem: {
    width: (width - 32 - 30) / 4,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    position: 'relative',
  },
  recentCover: { width: '100%', height: '100%' },
  recentSourceBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    padding: 3,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    height: 54,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  progressBarBg: { height: 2, backgroundColor: '#3A3A3C', width: '100%' },
  progressBarFill: { height: '100%', backgroundColor: '#fc3f1d' },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
  },
  playerCover: { width: 36, height: 36, borderRadius: 4, backgroundColor: '#2A2A2A' },
  playerMeta: { flex: 1, marginLeft: 12 },
  playerTrack: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  playerArtist: { color: '#8E8E93', fontSize: 11, marginTop: 1 },
  playerControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  controlIconBtn: { padding: 4 },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: '#0A0A0A',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#1C1C1E',
    paddingBottom: 4,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', width: 80 },
  tabLabel: { fontSize: 10, color: '#8E8E93', marginTop: 4, fontWeight: '500' },
  tabLabelActive: { color: '#fc3f1d' },
});