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
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Пример начальной очереди треков
const initialQueue = [
  { id: '1', title: 'Sunset Vibes', artist: 'Digital Horizon', cover: 'https://picsum.photos/seed/sunset/150/150', isCurrent: true },
  { id: '2', title: 'City Lights', artist: 'Neon Walker', cover: 'https://picsum.photos/seed/track1/150/150', isCurrent: false },
  { id: '3', title: 'Echoes of Rain', artist: 'Ambient Lab', cover: 'https://picsum.photos/seed/track2/150/150', isCurrent: false },
  { id: '4', title: 'Midnight Drive', artist: 'Synth Wave Band', cover: 'https://picsum.photos/seed/track3/150/150', isCurrent: false },
  { id: '5', title: 'Neon Highway', artist: 'Cyberpunk Project', cover: 'https://picsum.photos/seed/track4/150/150', isCurrent: false },
  { id: '6', title: 'Deep Space', artist: 'Solaris', cover: 'https://picsum.photos/seed/track5/150/150', isCurrent: false },
];

export default function QueueScreen({ onClose, onSelectTrack }) {
  const [queue, setQueue] = useState(initialQueue);

  // Удаление трека из очереди
  const removeTrack = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Очистка очереди (кроме текущего трека)
  const clearQueue = () => {
    setQueue((prev) => prev.filter((item) => item.isCurrent));
  };

  // Перемещение трека вверх по списку
  const moveUp = (index) => {
    if (index <= 1) return; // Не двигаем выше текущего играющего (индекс 0)
    const newQueue = [...queue];
    const temp = newQueue[index];
    newQueue[index] = newQueue[index - 1];
    newQueue[index - 1] = temp;
    setQueue(newQueue);
  };

  // Перемещение трека вниз по списку
  const moveDown = (index) => {
    if (index === 0 || index >= queue.length - 1) return;
    const newQueue = [...queue];
    const temp = newQueue[index];
    newQueue[index] = newQueue[index + 1];
    newQueue[index + 1] = temp;
    setQueue(newQueue);
  };

  const currentTrack = queue.find((t) => t.isCurrent);
  const upNextTracks = queue.filter((t) => !t.isCurrent);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Верхняя панель */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
          <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Очередь воспроизведения</Text>
        <TouchableOpacity onPress={clearQueue} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Очистить</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          currentTrack && (
            <View style={styles.currentTrackSection}>
              <Text style={styles.sectionTitle}>СЕЙЧАС ИГРАЕТ</Text>
              <View style={styles.currentTrackRow}>
                <Image source={{ uri: currentTrack.cover }} style={styles.currentCover} />
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, styles.activeTrackTitle]} numberOfLines={1}>
                    {currentTrack.title}
                  </Text>
                  <Text style={styles.artistName} numberOfLines={1}>
                    {currentTrack.artist}
                  </Text>
                </View>
                {/* Анимированный значок волны/эквалайзера */}
                <View style={styles.equalizerBadge}>
                  <Ionicons name="volume-high" size={20} color="#fc3f1d" />
                </View>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ДАЛЕЕ В ОЧЕРЕДИ</Text>
            </View>
          )
        }
        renderItem={({ item, index }) => {
          if (item.isCurrent) return null; // Текущий уже отрисован в шапке

          return (
            <View style={styles.trackRow}>
              <TouchableOpacity 
                style={styles.trackMainTouch}
                onPress={() => onSelectTrack && onSelectTrack(item)}
              >
                <Image source={{ uri: item.cover }} style={styles.trackCover} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
                </View>
              </TouchableOpacity>

              {/* Кнопки перестановки порядка треков */}
              <View style={styles.reorderControls}>
                <TouchableOpacity 
                  onPress={() => moveUp(index)} 
                  disabled={index === 1}
                  style={[styles.arrowBtn, index === 1 && styles.disabledBtn]}
                >
                  <Ionicons name="chevron-up" size={18} color={index === 1 ? '#444' : '#BBB'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => moveDown(index)} 
                  disabled={index === queue.length - 1}
                  style={[styles.arrowBtn, index === queue.length - 1 && styles.disabledBtn]}
                >
                  <Ionicons name="chevron-down" size={18} color={index === queue.length - 1 ? '#444' : '#BBB'} />
                </TouchableOpacity>
              </View>

              {/* Удаление из очереди */}
              <TouchableOpacity onPress={() => removeTrack(item.id)} style={styles.removeBtn}>
                <Ionicons name="close" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Очередь пуста</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161314',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#262224',
  },
  iconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    color: '#fc3f1d',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  currentTrackSection: {
    marginBottom: 8,
  },
  currentTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#241D1F',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#fc3f1d',
  },
  currentCover: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#201C1E',
  },
  trackMainTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackCover: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#262224',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeTrackTitle: {
    color: '#fc3f1d',
  },
  artistName: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  equalizerBadge: {
    padding: 4,
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  arrowBtn: {
    padding: 6,
    backgroundColor: '#241D1F',
    borderRadius: 6,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  removeBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
  },
});