import React from 'react';
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
  FlatList
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAudio } from './src/services/AudioContext';

const { width } = Dimensions.get('window');

const topRowData = [
  { id: 'my_wave', type: 'wave', title: 'Моя волна', bgColor: '#7B1FA2' },
  { 
    id: 'daily_playlist', 
    type: 'split', 
    title: 'Плейлист дня', 
    bgColor: '#D32F2F',
    images: ['https://picsum.photos/seed/playlist1/100/100', 'https://picsum.photos/seed/playlist2/100/100']
  },
  { 
    id: 'new_releases', 
    type: 'single', 
    title: 'Новинки', 
    bgColor: '#303F9F', 
    image: 'https://picsum.photos/seed/newrel/150/150' 
  }
];

const recentlyPlayed = [
  { id: '1', cover: 'https://picsum.photos/seed/rc1/150/150' },
  { id: '2', cover: 'https://picsum.photos/seed/rc2/150/150' },
  { id: '3', cover: 'https://picsum.photos/seed/rc3/150/150' },
  { id: '4', cover: 'https://picsum.photos/seed/rc4/150/150' },
  { id: '5', cover: 'https://picsum.photos/seed/rc5/150/150' },
  { id: '6', cover: 'https://picsum.photos/seed/rc6/150/150' },
  { id: '7', cover: 'https://picsum.photos/seed/rc7/150/150' },
  { id: '8', cover: 'https://picsum.photos/seed/rc8/150/150' },
];

export default function HomeScreen({ 
  currentTrack: propTrack, 
  isPlaying: propPlaying, 
  onTogglePlay: propTogglePlay, 
  onOpenPlayer, 
  onOpenLibrary, 
  onOpenSettings, 
  onOpenSearch, 
  onOpenAlbum 
}) {
  // Получаем состояние из AudioContext (если провайдер смонтирован)
  const audioContext = useAudio?.() || {};
  const activeTrack = audioContext.currentTrack || propTrack;
  const activeIsPlaying = audioContext.isPlaying !== undefined ? audioContext.isPlaying : propPlaying;
  const handleTogglePlay = audioContext.togglePlay || propTogglePlay;
  const handleNextTrack = audioContext.nextTrack;

  // Расчет прогресса таймлайна мини-плеера
  const progressPercent = audioContext.duration > 0 
    ? `${(audioContext.position / audioContext.duration) * 100}%` 
    : '45%';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Шапка */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Главная</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={onOpenSettings}>
            <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onOpenSearch}>
            <Ionicons name="search-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Карусель */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topRowContainer}>
          {topRowData.map((item) => (
            <View key={item.id} style={styles.topCardWrapper}>
              
              {/* Карточка 1: Моя волна */}
              {item.type === 'wave' && (
                <View style={[styles.topCard, { backgroundColor: item.bgColor }]}>
                  <View style={styles.waveIndicator}>
                    <View style={[styles.waveLine, { height: 8 }]} />
                    <View style={[styles.waveLine, { height: 14 }]} />
                    <View style={[styles.waveLine, { height: 10 }]} />
                  </View>
                  <TouchableOpacity 
                    style={styles.wavePlayButton} 
                    onPress={() => onOpenPlayer?.()}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="play" size={22} color="#fc3f1d" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Карточка 2: Плейлист дня */}
              {item.type === 'split' && (
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => onOpenAlbum?.({ 
                    title: 'Плейлист дня', 
                    cover: item.images[0], 
                    subtitle: 'Ежедневная подборка с вашего сервера' 
                  })}
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

              {/* Карточка 3: Новинки */}
              {item.type === 'single' && (
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => onOpenAlbum?.({ 
                    title: 'Новинки', 
                    cover: item.image, 
                    subtitle: 'Свежие релизы с сервера' 
                  })}
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

        {/* Недавно прослушанное */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Недавно прослушанное</Text>
          <FlatList
            data={recentlyPlayed}
            keyExtractor={(item) => item.id}
            numColumns={4}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.recentItem} 
                onPress={() => onOpenAlbum?.({ 
                  title: `Альбом #${item.id}`, 
                  cover: item.cover, 
                  subtitle: 'Треки с сервера' 
                })}
              >
                <Image source={{ uri: item.cover }} style={styles.recentCover} />
              </TouchableOpacity>
            )}
            columnWrapperStyle={styles.gridRow}
          />
        </View>
      </ScrollView>

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
                <Ionicons 
                  name={activeIsPlaying ? "pause" : "play"} 
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
          <Ionicons name="home" size={20} color="#FFFFFF" />
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
    paddingBottom: 8 
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  headerIcons: { flexDirection: 'row', gap: 16 },
  iconButton: { padding: 4 },
  scrollContent: { paddingBottom: 160 },
  topRowContainer: { paddingLeft: 16, paddingRight: 8, marginVertical: 16 },
  topCardWrapper: { marginRight: 14, width: 135 },
  topCard: { 
    width: 135, 
    height: 135, 
    borderRadius: 16, 
    padding: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  waveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  waveLine: {
    width: 2.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  wavePlayButton: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  splitCard: { justifyContent: 'space-between', alignItems: 'flex-start' },
  splitCardTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  splitImages: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', height: 54, gap: 6 },
  halfImage: { flex: 1, height: '100%', borderRadius: 8, backgroundColor: '#222' },
  singleImageContainer: { width: '100%', height: 54, alignItems: 'flex-start' },
  singleImage: { width: 54, height: 54, borderRadius: 8, backgroundColor: '#222' },
  topCardLabel: { color: '#B3B3B3', fontSize: 13, fontWeight: '500', marginTop: 8 },
  section: { paddingHorizontal: 16, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
  gridRow: { justifyContent: 'space-between', marginBottom: 10 },
  recentItem: { width: (width - 32 - 30) / 4, aspectRatio: 1, borderRadius: 6, overflow: 'hidden', backgroundColor: '#1E1E1E' },
  recentCover: { width: '100%', height: '100%' },
  miniPlayer: { 
    position: 'absolute', 
    bottom: 56, 
    left: 0, 
    right: 0, 
    height: 54, 
    backgroundColor: '#1C1C1E', 
    borderBottomWidth: 1, 
    borderBottomColor: '#2C2C2E' 
  },
  progressBarBg: { height: 2, backgroundColor: '#3A3A3C', width: '100%' },
  progressBarFill: { height: '100%', backgroundColor: '#fc3f1d' },
  miniPlayerContent: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 12 },
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
    paddingBottom: 4 
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', width: 80 },
  tabLabel: { fontSize: 10, color: '#8E8E93', marginTop: 4 },
  tabLabelActive: { color: '#FFFFFF' },
});