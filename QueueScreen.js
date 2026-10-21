// QueueScreen.js
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
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from './src/services/AudioContext';

const initialQueue = [
  { id: '1', title: 'Sunset Vibes', artist: 'Digital Horizon', cover: 'https://picsum.photos/seed/sunset/150/150', isCurrent: true, isLocal: false },
  { id: '2', title: 'City Lights', artist: 'Neon Walker', cover: 'https://picsum.photos/seed/track1/150/150', isCurrent: false, isLocal: false },
  { id: '3', title: 'Echoes of Rain', artist: 'Ambient Lab', cover: 'https://picsum.photos/seed/track2/150/150', isCurrent: false, isLocal: true },
  { id: '4', title: 'Midnight Drive', artist: 'Synth Wave Band', cover: 'https://picsum.photos/seed/track3/150/150', isCurrent: false, isLocal: false },
  { id: '5', title: 'Neon Highway', artist: 'Cyberpunk Project', cover: 'https://picsum.photos/seed/track4/150/150', isCurrent: false, isLocal: true },
];

export default function QueueScreen({ onClose, onSelectTrack }) {
  const audioContext = useAudio?.() || {};
  const [localQueue, setLocalQueue] = useState(
    audioContext.queue?.length > 0 ? audioContext.queue : initialQueue
  );

  const activeTrackId =
    audioContext.currentTrack?.id ||
    localQueue.find((t) => t.isCurrent)?.id ||
    localQueue[0]?.id;

  const syncQueue = (updated) => {
    setLocalQueue(updated);
    if (audioContext.setQueue) {
      audioContext.setQueue(updated);
    }
  };

  const removeTrack = (id) => {
    syncQueue(localQueue.filter((item) => item.id !== id));
  };

  const clearQueue = () => {
    syncQueue(localQueue.filter((item) => item.id === activeTrackId));
  };

  const shuffleUpcoming = () => {
    const current = localQueue.filter((item) => item.id === activeTrackId);
    const others = localQueue
      .filter((item) => item.id !== activeTrackId)
      .sort(() => Math.random() - 0.5);
    syncQueue([...current, ...others]);
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    const newQueue = [...localQueue];
    const temp = newQueue[index];
    newQueue[index] = newQueue[index - 1];
    newQueue[index - 1] = temp;
    syncQueue(newQueue);
  };

  const moveDown = (index) => {
    if (index >= localQueue.length - 1) return;
    const newQueue = [...localQueue];
    const temp = newQueue[index];
    newQueue[index] = newQueue[index + 1];
    newQueue[index + 1] = temp;
    syncQueue(newQueue);
  };

  const handlePlayFromQueue = (item) => {
    if (audioContext.playTrack) {
      audioContext.playTrack(item, localQueue);
    }
    onSelectTrack?.(item);
  };

  const currentTrack = localQueue.find((t) => t.id === activeTrackId) || localQueue[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Верхняя панель */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
          <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Очередь воспроизведения</Text>
          <Text style={styles.headerSubtitle}>{localQueue.length} треков в списке</Text>
        </View>
        <TouchableOpacity onPress={clearQueue} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Очистить</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={localQueue}
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
                <View style={styles.equalizerBadge}>
                  <Ionicons name="volume-high" size={20} color="#fc3f1d" />
                </View>
              </View>

              <View style={styles.upNextHeader}>
                <Text style={styles.sectionTitle}>ДАЛЕЕ В ОЧЕРЕДИ</Text>
                <TouchableOpacity style={styles.shuffleBtn} onPress={shuffleUpcoming}>
                  <Ionicons name="shuffle" size={15} color="#fc3f1d" />
                  <Text style={styles.shuffleBtnText}>Перемешать</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }
        renderItem={({ item, index }) => {
          if (item.id === activeTrackId) return null;

          return (
            <View style={styles.trackRow}>
              <TouchableOpacity
                style={styles.trackMainTouch}
                onPress={() => handlePlayFromQueue(item)}
              >
                <Image source={{ uri: item.cover }} style={styles.trackCover} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={styles.artistRow}>
                    <Ionicons
                      name={item.isLocal ? 'phone-portrait-outline' : 'cloud-outline'}
                      size={11}
                      color="#8E8E93"
                    />
                    <Text style={styles.artistName} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.reorderControls}>
                <TouchableOpacity
                  onPress={() => moveUp(index)}
                  disabled={index === 0}
                  style={[styles.arrowBtn, index === 0 && styles.disabledBtn]}
                >
                  <Ionicons name="chevron-up" size={18} color="#BBB" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => moveDown(index)}
                  disabled={index === localQueue.length - 1}
                  style={[
                    styles.arrowBtn,
                    index === localQueue.length - 1 && styles.disabledBtn,
                  ]}
                >
                  <Ionicons name="chevron-down" size={18} color="#BBB" />
                </TouchableOpacity>
              </View>

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
  container: { flex: 1, backgroundColor: '#161314' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#262224',
  },
  iconBtn: { padding: 4 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  clearBtn: { padding: 6 },
  clearBtnText: { color: '#fc3f1d', fontSize: 14, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  currentTrackSection: { marginBottom: 8 },
  currentTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#241D1F',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#fc3f1d',
    marginTop: 10,
  },
  currentCover: { width: 48, height: 48, borderRadius: 6 },
  upNextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shuffleBtnText: { color: '#fc3f1d', fontSize: 12, fontWeight: '600' },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#201C1E',
  },
  trackMainTouch: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trackCover: { width: 44, height: 44, borderRadius: 6, backgroundColor: '#262224' },
  trackInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  trackTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  activeTrackTitle: { color: '#fc3f1d' },
  artistRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  artistName: { fontSize: 13, color: '#8E8E93' },
  equalizerBadge: { padding: 4 },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  arrowBtn: { padding: 6, backgroundColor: '#241D1F', borderRadius: 6 },
  disabledBtn: { opacity: 0.25 },
  removeBtn: { padding: 6 },
  emptyContainer: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: '#8E8E93', fontSize: 15 },
});