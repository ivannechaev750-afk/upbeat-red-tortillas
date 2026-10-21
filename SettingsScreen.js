// SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

const SETTINGS_KEY = '@streamplayer_app_settings';
const eqPresets = ['Рок • Усиление басов', 'Студийный Flat', 'Электроника', 'Вокал & Джаз'];
const crossfadeSteps = [0, 3, 6, 12];

export default function SettingsScreen({ onClose, onOpenServerConnect }) {
  const [offlineMode, setOfflineMode] = useState(false);
  const [losslessAudio, setLosslessAudio] = useState(true);
  const [normalizeVolume, setNormalizeVolume] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [eqIndex, setEqIndex] = useState(0);
  const [crossfade, setCrossfade] = useState(3);
  const [cacheSize, setCacheSize] = useState('1.4 ГБ');

  useEffect(() => {
    const loadSettings = async () => {
      if (!AsyncStorage) return;
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          if (s.offlineMode !== undefined) setOfflineMode(s.offlineMode);
          if (s.losslessAudio !== undefined) setLosslessAudio(s.losslessAudio);
          if (s.normalizeVolume !== undefined) setNormalizeVolume(s.normalizeVolume);
          if (s.autoSync !== undefined) setAutoSync(s.autoSync);
          if (s.eqIndex !== undefined) setEqIndex(s.eqIndex);
          if (s.crossfade !== undefined) setCrossfade(s.crossfade);
        }
      } catch (e) {}
    };
    loadSettings();
  }, []);

  const updateSetting = async (patch) => {
    if (!AsyncStorage) return;
    try {
      const current = {
        offlineMode,
        losslessAudio,
        normalizeVolume,
        autoSync,
        eqIndex,
        crossfade,
        ...patch,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(current));
    } catch (e) {}
  };

  const cycleEq = () => {
    const next = (eqIndex + 1) % eqPresets.length;
    setEqIndex(next);
    updateSetting({ eqIndex: next });
  };

  const cycleCrossfade = () => {
    const idx = crossfadeSteps.indexOf(crossfade);
    const next = crossfadeSteps[(idx + 1) % crossfadeSteps.length];
    setCrossfade(next);
    updateSetting({ crossfade: next });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Верхняя шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Блок 1: Сервер */}
        <Text style={styles.sectionHeader}>СЕРВЕР И СИНХРОНИЗАЦИЯ</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.itemRow} onPress={onOpenServerConnect}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#1A2980' }]}>
                <Feather name="server" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Адрес медиасервера</Text>
                <Text style={styles.itemSubtitle}>https://nas.home.local:8080</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#6E6A6C" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#2E7D32' }]}>
                <Ionicons name="sync-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Автосканирование библиотеки</Text>
                <Text style={styles.itemSubtitle}>При добавлении новых файлов</Text>
              </View>
            </View>
            <Switch
              value={autoSync}
              onValueChange={(v) => {
                setAutoSync(v);
                updateSetting({ autoSync: v });
              }}
              trackColor={{ false: '#333333', true: '#fc3f1d' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Блок 2: Звук */}
        <Text style={styles.sectionHeader}>ВОСПРОИЗВЕДЕНИЕ И ТРАФИК</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.itemRow} onPress={cycleEq}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E65100' }]}>
                <MaterialCommunityIcons name="equalizer" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Пресет эквалайзера</Text>
                <Text style={styles.itemSubtitle}>{eqPresets[eqIndex]}</Text>
              </View>
            </View>
            <Text style={styles.actionText}>Сменить</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.itemRow} onPress={cycleCrossfade}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#00695C' }]}>
                <Ionicons name="git-compare-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Плавный переход (Crossfade)</Text>
                <Text style={styles.itemSubtitle}>Сведение треков без пауз</Text>
              </View>
            </View>
            <Text style={styles.actionText}>
              {crossfade === 0 ? 'Выкл' : `${crossfade} сек`}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#C2185B' }]}>
                <Ionicons name="disc-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>FLAC / Lossless по Wi-Fi</Text>
                <Text style={styles.itemSubtitle}>Оригинальный поток без транскодинга</Text>
              </View>
            </View>
            <Switch
              value={losslessAudio}
              onValueChange={(v) => {
                setLosslessAudio(v);
                updateSetting({ losslessAudio: v });
              }}
              trackColor={{ false: '#333333', true: '#fc3f1d' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#512DA8' }]}>
                <Ionicons name="volume-medium-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Нормализация громкости</Text>
                <Text style={styles.itemSubtitle}>ReplayGain для локальных и серверных треков</Text>
              </View>
            </View>
            <Switch
              value={normalizeVolume}
              onValueChange={(v) => {
                setNormalizeVolume(v);
                updateSetting({ normalizeVolume: v });
              }}
              trackColor={{ false: '#333333', true: '#fc3f1d' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Блок 3: Хранилище */}
        <Text style={styles.sectionHeader}>ХРАНИЛИЩЕ И ОФЛАЙН</Text>
        <View style={styles.card}>
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#00838F' }]}>
                <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Только офлайн-режим</Text>
                <Text style={styles.itemSubtitle}>Использовать только скачанные треки</Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={(v) => {
                setOfflineMode(v);
                updateSetting({ offlineMode: v });
              }}
              trackColor={{ false: '#333333', true: '#fc3f1d' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.itemRow}
            onPress={() => setCacheSize('0 МБ')}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#424242' }]}>
                <Ionicons name="trash-bin-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Кэш аудиопотока</Text>
                <Text style={styles.itemSubtitle}>Занято {cacheSize}</Text>
              </View>
            </View>
            <Text style={styles.actionText}>
              {cacheSize === '0 МБ' ? 'Очищено' : 'Очистить'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.appVersion}>StreamPlayer v1.1.0 (Hybrid Streaming & Local)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0E0E' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1C1C1E',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 14,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#18181A',
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  itemSubtitle: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  divider: { height: 0.5, backgroundColor: '#262628', marginLeft: 60 },
  actionText: { fontSize: 13, color: '#fc3f1d', fontWeight: '600' },
  appVersion: { textAlign: 'center', color: '#555555', fontSize: 12, marginTop: 32 },
});