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
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Тестовый набор треков альбома
const defaultAlbumTracks = [
  { id: '1', number: '1', title: 'Midnight City', duration: '3:45', artist: 'Digital Horizon' },
  { id: '2', number: '2', title: 'Sunset Vibes', duration: '3:12', artist: 'Digital Horizon' },
  { id: '3', number: '3', title: 'Neon Horizon', duration: '4:02', artist: 'Digital Horizon' },
  { id: '4', number: '4', title: 'Night Drive', duration: '2:58', artist: 'Digital Horizon' },
  { id: '5', number: '5', title: 'Echoes of Rain', duration: '3:30', artist: 'Digital Horizon' },
  { id: '6', number: '6', title: 'Electric Skyline', duration: '4:15', artist: 'Digital Horizon' },
];

export default function AlbumDetailScreen({ album, onClose, onOpenPlayer }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Используем переданный альбом или дефолтные значения
  const title = album?.title || 'Плейлист дня';
  const coverUri = album?.cover || 'https://picsum.photos/seed/playlist1/400/400';
  const subtitle = album?.subtitle || 'Персональная подборка с вашего сервера';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Верхняя навигация */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="more-vertical" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={defaultAlbumTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            {/* Обложка */}
            <Image source={{ uri: coverUri }} style={styles.albumCover} />

            {/* Описание */}
            <Text style={styles.albumTitle}>{title}</Text>
            <Text style={styles.albumSubtitle}>{subtitle}</Text>
            <Text style={styles.albumMeta}>6 треков • 21 мин • 2026</Text>

            {/* Кнопки действий */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.likeBtn}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={26}
                  color={isLiked ? '#fc3f1d' : '#8E8E93'}
                />
              </TouchableOpacity>

              <View style={styles.playbackButtons}>
                {/* Перемешать */}
                <TouchableOpacity style={styles.shuffleButton} onPress={onOpenPlayer}>
                  <Ionicons name="shuffle" size={20} color="#FFFFFF" />
                  <Text style={styles.shuffleText}>Перемешать</Text>
                </TouchableOpacity>

                {/* Слушать всё */}
                <TouchableOpacity style={styles.playAllButton} onPress={onOpenPlayer}>
                  <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
                  <Text style={styles.playAllText}>Слушать</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.7} onPress={onOpenPlayer} style={styles.trackRow}>
            <Text style={styles.trackNumber}>{item.number}</Text>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <Text style={styles.trackDuration}>{item.duration}</Text>
            <TouchableOpacity style={styles.trackMenuBtn}>
              <Feather name="more-horizontal" size={18} color="#6E6A6C" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

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
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="play-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E0E',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconBtn: {
    padding: 6,
  },
  listContent: {
    paddingBottom: 100, // отступ под мини-плеер
  },
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
    width: width * 0.55,
    height: width * 0.55,
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
  albumMeta: {
    fontSize: 12,
    color: '#6E6A6C',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  likeBtn: {
    padding: 8,
  },
  playbackButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242426',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    gap: 6,
  },
  shuffleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fc3f1d',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    gap: 6,
  },
  playAllText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  trackNumber: {
    color: '#6E6A6C',
    fontSize: 14,
    fontWeight: '500',
    width: 24,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 8,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  trackArtist: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  trackDuration: {
    color: '#6E6A6C',
    fontSize: 12,
    marginRight: 10,
  },
  trackMenuBtn: {
    padding: 4,
  },
  // Мини-плеер
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
});