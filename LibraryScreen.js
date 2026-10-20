import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import ImportModal from './ImportModal';
import { useAudio } from './src/services/AudioContext';

// Безопасный импорт AsyncStorage с фоллбеком для Expo Snack
let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

const STORAGE_KEY = '@streamplayer_library_tracks';

const tabs = ['Треки', 'Альбомы', 'Плейлисты', 'Скачанные'];

const initialTracksData = [
  { id: '1', title: 'City Lights', artist: 'Neon Walker', cover: 'https://picsum.photos/seed/track1/150/150', liked: false, isLocal: false, uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: '2', title: 'Echoes of Rain', artist: 'Ambient Lab', cover: 'https://picsum.photos/seed/track2/150/150', liked: false, isLocal: false, uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: '3', title: 'Sunset Vibes', artist: 'Digital Horizon', cover: 'https://picsum.photos/seed/sunset/150/150', liked: true, isLocal: false, uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
];

export default function LibraryScreen({ 
  currentTrack: propTrack, 
  isPlaying: propPlaying, 
  onTogglePlay: propTogglePlay, 
  onOpenPlayer, 
  onGoHome, 
  onGoSearch 
}) {
  const [activeTab, setActiveTab] = useState('Треки');
  const [tracks, setTracks] = useState([]);
  const [isImportVisible, setIsImportVisible] = useState(false);

  // Получаем данные и методы управления звуком из AudioContext
  const audioContext = useAudio?.() || {};
  const activeTrack = audioContext.currentTrack || propTrack;
  const activeIsPlaying = audioContext.isPlaying !== undefined ? audioContext.isPlaying : propPlaying;
  const handleTogglePlay = audioContext.togglePlay || propTogglePlay;
  const handleNextTrack = audioContext.nextTrack;

  // 1. Загрузка треков из AsyncStorage при запуске
  useEffect(() => {
    const loadSavedTracks = async () => {
      if (AsyncStorage) {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.length > 0) {
              setTracks(parsed);
              if (audioContext.setQueue && (!audioContext.queue || audioContext.queue.length === 0)) {
                audioContext.setQueue(parsed);
              }
              return;
            }
          }
        } catch (err) {
          console.warn('Ошибка загрузки библиотеки:', err);
        }
      }
      setTracks(initialTracksData);
      if (audioContext.setQueue && (!audioContext.queue || audioContext.queue.length === 0)) {
        audioContext.setQueue(initialTracksData);
      }
    };

    loadSavedTracks();
  }, []);

  // Вспомогательное сохранение треков
  const persistTracks = async (updatedList) => {
    setTracks(updatedList);
    if (audioContext.setQueue) {
      audioContext.setQueue(updatedList);
    }
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      } catch (err) {
        console.warn('Ошибка сохранения библиотеки:', err);
      }
    }
  };

  // 2. Выбор трека для воспроизведения
  const handleSelectTrack = (track) => {
    if (audioContext.playTrack) {
      audioContext.playTrack(track, tracks);
    }
    onOpenPlayer?.(track);
  };

  // 3. Лайк трека
  const toggleLike = (id) => {
    const updated = tracks.map((item) =>
      item.id === id ? { ...item, liked: !item.liked } : item
    );
    persistTracks(updated);
  };

  // 4. Импорт треков с телефона
  const handleImportSuccess = (newTracks) => {
    const formatted = newTracks.map(t => ({ ...t, isLocal: true }));
    const merged = [...formatted, ...tracks];
    persistTracks(merged);
  };

  // 5. Удаление трека
  const removeTrack = (id) => {
    const updated = tracks.filter((t) => t.id !== id);
    persistTracks(updated);
  };

  // Фильтрация треков по вкладкам
  const displayedTracks = tracks.filter((item) => {
    if (activeTab === 'Скачанные') return item.isLocal === true;
    return true;
  });

  // Расчет прогресса таймлайна мини-плеера
  const progressPercent = audioContext.duration > 0 
    ? `${(audioContext.position / audioContext.duration) * 100}%` 
    : '45%';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Шапка */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Коллекция</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setIsImportVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Импорт</Text>
        </TouchableOpacity>
      </View>

      {/* Горизонтальные вкладки */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
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

      {/* Список треков */}
      <FlatList
        data={displayedTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Здесь пока ничего нет</Text>
            <Text style={styles.emptySubtext}>Нажмите кнопку «Импорт», чтобы добавить аудиофайлы</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isCurrentActive = activeTrack?.id === item.id;
          return (
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => handleSelectTrack(item)} 
              style={styles.trackRow}
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
                      <Text style={styles.localBadgeText}>Устройство</Text>
                    </View>
                  )}
                  <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
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
                <TouchableOpacity 
                  onPress={() => removeTrack(item.id)} 
                  style={styles.actionBtn}
                >
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

      {/* Мини-плеер внизу экрана */}
      {activeTrack && (
        <TouchableOpacity activeOpacity={0.9} onPress={() => onOpenPlayer?.()} style={styles.miniPlayer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: progressPercent }]} />
          </View>
          <View style={styles.miniPlayerContent}>
            <Image 
              source={{ uri: activeTrack.cover || 'https://picsum.photos/seed/sunset/100/100' }} 
              style={styles.playerCover} 
            />
            <View style={styles.playerMeta}>
              <Text style={styles.playerTrack} numberOfLines={1}>{activeTrack.title} —</Text>
              <Text style={styles.playerArtist} numberOfLines={1}>{activeTrack.artist}</Text>
            </View>
            <View style={styles.playerControls}>
              <TouchableOpacity 
                onPress={(e) => { 
                  e.stopPropagation?.(); 
                  handleTogglePlay?.(); 
                }}
                style={styles.controlIconBtn}
              >
                <Ionicons name={activeIsPlaying ? "pause" : "play"} size={24} color="#FFFFFF" />
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
  container: {
    flex: 1,
    backgroundColor: '#0E0E0E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242426',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  tabsContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#202020',
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 20,
  },
  tabButton: {
    paddingVertical: 10,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#fc3f1d',
  },
  tabText: {
    fontSize: 16,
    color: '#707070',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fc3f1d',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 140,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  trackCover: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 14,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeTrackTitle: {
    color: '#fc3f1d',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  localBadge: {
    backgroundColor: '#2A2426',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  localBadgeText: {
    color: '#fc3f1d',
    fontSize: 10,
    fontWeight: '600',
  },
  artistName: {
    fontSize: 13,
    color: '#8E8E93',
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 6,
    textAlign: 'center',
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
  progressBarBg: {
    height: 2,
    backgroundColor: '#3A3A3C',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fc3f1d',
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
  },
  playerCover: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
  },
  playerMeta: {
    flex: 1,
    marginLeft: 12,
  },
  playerTrack: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  playerArtist: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 1,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  controlIconBtn: {
    padding: 4,
  },
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
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  navLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#fc3f1d',
  },
});