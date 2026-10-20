import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

// Безопасный импорт AsyncStorage с фоллбеком для Snack
let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

const STORAGE_KEY = '@streamplayer_search_history';

const defaultHistory = [
  'Digital Horizon',
  'Ambient Lab',
  'Cyberpunk 2088',
  'Synthwave',
];

const genresData = [
  { id: '1', title: 'Электроника', color: '#8E24AA' },
  { id: '2', title: 'Рок', color: '#D32F2F' },
  { id: '3', title: 'Хип-хоп', color: '#F57C00' },
  { id: '4', title: 'Саундтреки', color: '#1976D2' },
  { id: '5', title: 'Лоу-фай', color: '#388E3C' },
  { id: '6', title: 'Джаз & Блюз', color: '#5D4037' },
];

const allTracks = [
  { id: '1', title: 'Sunset Vibes', artist: 'Digital Horizon', cover: 'https://picsum.photos/seed/sunset/150/150' },
  { id: '2', title: 'City Lights', artist: 'Neon Walker', cover: 'https://picsum.photos/seed/track1/150/150' },
  { id: '3', title: 'Echoes of Rain', artist: 'Ambient Lab', cover: 'https://picsum.photos/seed/track2/150/150' },
  { id: '4', title: 'Midnight Highway', artist: 'Synth Wave Band', cover: 'https://picsum.photos/seed/track3/150/150' },
  { id: '5', title: 'Electric Dreams', artist: 'Cyberpunk Project', cover: 'https://picsum.photos/seed/track4/150/150' },
];

export default function SearchScreen({ onOpenPlayer, onGoHome, onGoLibrary }) {
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. Загрузка истории поиска из AsyncStorage при старте
  useEffect(() => {
    const loadHistory = async () => {
      if (AsyncStorage) {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (raw) {
            setSearchHistory(JSON.parse(raw));
            return;
          }
        } catch (err) {
          console.warn('Не удалось загрузить историю поиска:', err);
        }
      }
      setSearchHistory(defaultHistory);
    };

    loadHistory();
  }, []);

  // Вспомогательное сохранение в хранилище
  const persistHistory = async (newList) => {
    setSearchHistory(newList);
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      } catch (err) {
        console.warn('Ошибка сохранения истории поиска:', err);
      }
    }
  };

  // 2. Добавление запроса в историю (без дубликатов, в начало списка)
  const addQueryToHistory = (text) => {
    const clean = text.trim();
    if (!clean) return;
    const filtered = searchHistory.filter((item) => item.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 15);
    persistHistory(updated);
  };

  // 3. Удаление одного элемента
  const removeHistoryItem = (itemToRemove) => {
    const updated = searchHistory.filter((item) => item !== itemToRemove);
    persistHistory(updated);
  };

  // 4. Очистка всей истории
  const clearAllHistory = () => {
    persistHistory([]);
  };

  // 5. Выбор из подсказок или карточек
  const selectSearch = (text) => {
    setQuery(text);
    addQueryToHistory(text);
  };

  // Фильтрация результатов
  const searchResults = query.trim() === '' ? [] : allTracks.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.artist.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Поисковая строка */}
      <View style={styles.header}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Треки, артисты или альбомы"
            placeholderTextColor="#6E6A6C"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => addQueryToHistory(query)}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Выдача поиска или История + Жанры */}
      {query.trim().length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Ничего не найдено</Text>
              <Text style={styles.emptySubtext}>Проверьте правильность написания на сервере</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.trackRow} 
              onPress={() => {
                addQueryToHistory(item.title);
                onOpenPlayer && onOpenPlayer();
              }}
            >
              <Image source={{ uri: item.cover }} style={styles.trackCover} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.artistName}>{item.artist}</Text>
              </View>
              <Feather name="more-vertical" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* История поиска */}
          {searchHistory.length > 0 && (
            <View style={styles.historySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>История поиска</Text>
                <TouchableOpacity onPress={clearAllHistory}>
                  <Text style={styles.clearHistoryText}>Очистить</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.historyList}>
                {searchHistory.map((item, index) => (
                  <View key={index} style={styles.historyRow}>
                    <TouchableOpacity 
                      style={styles.historyItemContent} 
                      onPress={() => selectSearch(item)}
                    >
                      <Ionicons name="time-outline" size={18} color="#8E8E93" />
                      <Text style={styles.historyItemText}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => removeHistoryItem(item)}
                      style={styles.historyRemoveBtn}
                    >
                      <Ionicons name="close" size={18} color="#6E6A6C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Жанры */}
          <View style={styles.genresSection}>
            <Text style={styles.sectionTitle}>Все жанры</Text>
            <View style={styles.genreGrid}>
              {genresData.map((genre) => (
                <TouchableOpacity 
                  key={genre.id} 
                  style={[styles.genreCard, { backgroundColor: genre.color }]}
                  activeOpacity={0.8}
                  onPress={() => selectSearch(genre.title)}
                >
                  <Text style={styles.genreCardTitle}>{genre.title}</Text>
                  <Ionicons 
                    name="musical-notes" 
                    size={40} 
                    color="rgba(255,255,255,0.18)" 
                    style={styles.genreBgIcon} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Мини-плеер */}
      <TouchableOpacity activeOpacity={0.9} onPress={onOpenPlayer} style={styles.miniPlayer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '45%' }]} />
        </View>

        <View style={styles.miniPlayerContent}>
          <Image
            source={{ uri: 'https://picsum.photos/seed/sunset/100/100' }}
            style={styles.playerCover}
          />
          <View style={styles.playerMeta}>
            <Text style={styles.playerTrack} numberOfLines={1}>Sunset Vibes —</Text>
            <Text style={styles.playerArtist} numberOfLines={1}>Digital Horizon</Text>
          </View>
          <View style={styles.playerControls}>
            <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); setIsPlaying(!isPlaying); }}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="play-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Навигация */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={onGoHome}>
          <Ionicons name="home-outline" size={20} color="#8E8E93" />
          <Text style={styles.navLabel}>Главная</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="search" size={20} color="#fc3f1d" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Поиск</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={onGoLibrary}>
          <Feather name="book-open" size={20} color="#8E8E93" />
          <Text style={styles.navLabel}>Коллекция</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E20',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 140,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 140,
  },
  historySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clearHistoryText: {
    fontSize: 13,
    color: '#fc3f1d',
    fontWeight: '600',
  },
  historyList: {
    gap: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyItemText: {
    color: '#CCCCCC',
    fontSize: 15,
  },
  historyRemoveBtn: {
    padding: 6,
  },
  genresSection: {
    marginTop: 8,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 12,
  },
  genreCard: {
    width: '48%',
    height: 86,
    borderRadius: 10,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  genreCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    zIndex: 1,
  },
  genreBgIcon: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    transform: [{ rotate: '15deg' }],
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  artistName: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 3,
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
    gap: 18,
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