// LibraryScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import ImportModal from './ImportModal';
import { useAudio } from './src/services/AudioContext';
import { StorageService } from './src/services/storageService';

const tabs = ['Все треки', 'На устройстве', 'Избранное'];

export default function LibraryScreen({
  currentTrack: propTrack,
  isPlaying: propPlaying,
  onTogglePlay: propTogglePlay,
  onOpenPlayer,
  onGoHome,
  onGoSearch,
}) {
  const [activeTab, setActiveTab] = useState('Все треки');
  const [tracks, setTracks] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [isImportVisible, setIsImportVisible] = useState(false);

  const audioContext = useAudio?.() || {};
  const activeTrack = audioContext.currentTrack || propTrack;
  const activeIsPlaying =
    audioContext.isPlaying !== undefined ? audioContext.isPlaying : propPlaying;
  const handleTogglePlay = audioContext.togglePlay || propTogglePlay;
  const handleNextTrack = audioContext.nextTrack;

  // Загружаем сохраненные треки при открытии экрана
  useEffect(() => {
    const loadLibrary = async () => {
      const saved = await StorageService.getTracks();
      if (saved && saved.length > 0) {
        setTracks(saved);
        if (audioContext.setQueue) {
          audioContext.setQueue(saved);
        }
      } else if (audioContext.queue?.length > 0) {
        setTracks(audioContext.queue);
      }
    };
    loadLibrary();
  }, []);

  const persistTracks = async (updatedList) => {
    setTracks(updatedList);
    if (audioContext.setQueue) {
      audioContext.setQueue(updatedList);
    }
    await StorageService.saveTracks(updatedList);
  };

  // Запуск выбранного трека
  const handleSelectTrack = async (track, customList = displayedTracks) => {
    if (audioContext.playTrack) {
      await audioContext.playTrack(track, customList);
    }
    onOpenPlayer?.(track);
  };

  // Обработка успешного импорта из памяти телефона
  const handleImportSuccess = async (newTracks) => {
    if (!newTracks || newTracks.length === 0) return;

    const merged = await StorageService.upsertTracks(newTracks);
    setTracks(merged);
    if (audioContext.setQueue) {
      audioContext.setQueue(merged);
    }

    // Автоматически запускаем первый добавленный трек
    if (audioContext.playTrack) {
      await audioContext.playTrack(newTracks[0], merged);
    }
  };

  const toggleLike = (id) => {
    const updated = tracks.map((item) =>
      item.id === id ? { ...item, liked: !item.liked } : item
    );
    persistTracks(updated);
  };

  const removeTrack = (id) => {
    const updated = tracks.filter((t) => t.id !== id);
    persistTracks(updated);
  };

  const displayedTracks = useMemo(() => {
    let list = tracks.filter((item) => {
      if (activeTab === 'На устройстве') return item.isLocal === true;
      if (activeTab === 'Избранное') return item.liked === true;
      return true;
    });

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.artist?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tracks, activeTab, filterQuery]);

  const progressPercent =
    audioContext.duration > 0
      ? `${Math.min((audioContext.position / audioContext.duration) * 100, 100)}%`
      : '0%';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Шапка */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Коллекция</Text>
          <Text style={styles.headerStats}>
            Треков в памяти: {tracks.filter((t) => t.isLocal).length}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsImportVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="folder-open-outline" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Добавить музыку</Text>
        </TouchableOpacity>
      </View>

      {/* Вкладки */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Поиск по локальной коллекции */}
      {tracks.length > 0 && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по названию или исполнителю..."
            placeholderTextColor="#6E6A6C"
            value={filterQuery}
            onChangeText={setFilterQuery}
          />
          {filterQuery.length > 0 && (
            <TouchableOpacity onPress={() => setFilterQuery('')}>
              <Ionicons name="close-circle" size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Список треков */}
      <FlatList
        data={displayedTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={52} color="#3A3A3C" />
            <Text style={styles.emptyText}>Ваша медиатека пуста</Text>
            <Text style={styles.emptySubtext}>
              Нажмите «Добавить музыку», чтобы разрешить доступ к файлам и загрузить песни из памяти телефона
            </Text>
            <TouchableOpacity
              style={styles.emptyImportBtn}
              onPress={() => setIsImportVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.emptyImportBtnText}>Импортировать с телефона</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const isCurrentActive = activeTrack?.id === item.id;
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleSelectTrack(item)}
              style={[styles.trackRow, isCurrentActive && styles.trackRowActive]}
            >
              <Image source={{ uri: item.cover }} style={styles.trackCover} />
              <View style={styles.trackInfo}>
                <Text
                  style={[styles.trackTitle, isCurrentActive && styles.activeTrackTitle]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <View style={styles.subtitleRow}>
                  {item.isLocal && (
                    <View style={styles.localBadge}>
                      <Text style={styles.localBadgeText}>{item.format || 'LOCAL'}</Text>
                    </View>
                  )}
                  <Text style={styles.artistName} numberOfLines={1}>
                    {item.artist}
                  </Text>
                  {item.duration && item.duration !== '0:00' && (
                    <Text style={styles.durationText}>• {item.duration}</Text>
                  )}
                </View>
              </View>
              <View style={styles.trackActions}>
                <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.actionBtn}>
                  <Ionicons
                    name={item.liked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={item.liked ? '#fc3f1d' : '#8E8E93'}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeTrack(item.id)} style={styles.actionBtn}>
                  <Feather name="trash-2" size={18} color="#6E6A6C" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Модальное окно импорта файлов */}
      <ImportModal
        visible={isImportVisible}
        onClose={() => setIsImportVisible(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Мини-плеер */}
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
        <TouchableOpacity style={styles.tabItem} onPress={onGoHome}>
          <Ionicons name="home-outline" size={20} color="#8E8E93" />
          <Text style={styles.navLabel}>Главная</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={onGoSearch}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <Text style={styles.navLabel}>Поиск</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="book-open" size={20} color="#fc3f1d" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Коллекция</Text>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF' },
  headerStats: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fc3f1d',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    gap: 6,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  tabsContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#202020',
  },
  tabsScroll: { paddingHorizontal: 20, gap: 20 },
  tabButton: { paddingVertical: 10 },
  tabButtonActive: { borderBottomWidth: 2, borderBottomColor: '#fc3f1d' },
  tabText: { fontSize: 15, color: '#707070', fontWeight: '500' },
  tabTextActive: { color: '#fc3f1d', fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181A',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 140 },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  trackRowActive: {
    backgroundColor: '#1A1617',
  },
  trackCover: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#222' },
  trackInfo: { flex: 1, marginLeft: 14 },
  trackTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  activeTrackTitle: { color: '#fc3f1d' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  localBadge: {
    backgroundColor: '#2A2022',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  localBadgeText: { color: '#fc3f1d', fontSize: 10, fontWeight: '700' },
  artistName: { fontSize: 13, color: '#8E8E93', flexShrink: 1 },
  durationText: { fontSize: 12, color: '#6E6A6C' },
  trackActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { padding: 6 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 12 },
  emptySubtext: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fc3f1d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
  },
  emptyImportBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
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
    paddingHorizontal: 16,
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
  navLabel: { fontSize: 10, color: '#8E8E93', marginTop: 4, fontWeight: '500' },
  navLabelActive: { color: '#fc3f1d' },
});