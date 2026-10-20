import React, { useState } from 'react';
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

export default function SettingsScreen({ onClose, onOpenServerConnect }) {
  // Состояния для переключателей
  const [offlineMode, setOfflineMode] = useState(false);
  const [losslessAudio, setLosslessAudio] = useState(true);
  const [normalizeVolume, setNormalizeVolume] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Верхняя шапка с кнопкой назад */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Блок 1: Подключение к личному серверу */}
        <Text style={styles.sectionHeader}>СЕРВЕР И СИНХРОНИЗАЦИЯ</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.itemRow} onPress={onOpenServerConnect}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#1A2980' }]}>
                <Feather name="server" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Адрес сервера</Text>
                <Text style={styles.itemSubtitle}>https://nas.home.local:8080</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#6E6A6C" />
          </TouchableOpacity>

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
              onValueChange={setAutoSync}
              trackColor={{ false: '#333333', true: '#fc3f1d' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Блок 2: Звук и воспроизведение */}
        <Text style={styles.sectionHeader}>ВОСПРОИЗВЕДЕНИЕ</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E65100' }]}>
                <MaterialCommunityIcons name="equalizer" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Эквалайзер</Text>
                <Text style={styles.itemSubtitle}>Рок, Усиление басов</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#6E6A6C" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#C2185B' }]}>
                <Ionicons name="disc-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>FLAC / Lossless качество</Text>
                <Text style={styles.itemSubtitle}>Без сжатия потока</Text>
              </View>
            </View>
            <Switch
              value={losslessAudio}
              onValueChange={setLosslessAudio}
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
                <Text style={styles.itemSubtitle}>Одинаковый уровень для всех треков</Text>
              </View>
            </View>
            <Switch
              value={normalizeVolume}
              onValueChange={setNormalizeVolume}
              trackColor={{ false: '#333333', true: '#fc3f1d' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Блок 3: Хранилище и офлайн */}
        <Text style={styles.sectionHeader}>ХРАНИЛИЩЕ</Text>
        <View style={styles.card}>
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#00838F' }]}>
                <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Офлайн-режим</Text>
                <Text style={styles.itemSubtitle}>Играть только сохраненное</Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: '#333333', true: '#fc3f1d' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#424242' }]}>
                <Ionicons name="trash-bin-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.itemTitle}>Очистить кеш</Text>
                <Text style={styles.itemSubtitle}>Занято 1.4 ГБ</Text>
              </View>
            </View>
            <Text style={styles.actionText}>Очистить</Text>
          </TouchableOpacity>
        </View>

        {/* Версия приложения */}
        <Text style={styles.appVersion}>StreamPlayer v1.0.0 (Personal Build)</Text>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1C1C1E',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
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
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#262628',
    marginLeft: 60,
  },
  actionText: {
    fontSize: 13,
    color: '#fc3f1d',
    fontWeight: '600',
  },
  appVersion: {
    textAlign: 'center',
    color: '#555555',
    fontSize: 12,
    marginTop: 32,
  },
});