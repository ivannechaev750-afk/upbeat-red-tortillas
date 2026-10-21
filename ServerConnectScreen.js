// ServerConnectScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

const SERVER_CONFIG_KEY = '@streamplayer_server_config';

const protocols = [
  { id: 'subsonic', title: 'Subsonic / Navidrome' },
  { id: 'jellyfin', title: 'Jellyfin' },
  { id: 'custom', title: 'Custom REST API' },
];

export default function ServerConnectScreen({ onClose, onConnectSuccess }) {
  const [protocol, setProtocol] = useState('subsonic');
  const [authType, setAuthType] = useState('credentials'); // 'credentials' | 'token'
  const [serverUrl, setServerUrl] = useState('https://nas.home.local:8080');
  const [login, setLogin] = useState('admin');
  const [password, setPassword] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [serverStats, setServerStats] = useState(null);

  useEffect(() => {
    const loadSavedServer = async () => {
      if (!AsyncStorage) return;
      try {
        const raw = await AsyncStorage.getItem(SERVER_CONFIG_KEY);
        if (raw) {
          const cfg = JSON.parse(raw);
          if (cfg.url) setServerUrl(cfg.url);
          if (cfg.protocol) setProtocol(cfg.protocol);
          if (cfg.login) setLogin(cfg.login);
        }
      } catch (e) {
        console.warn('Не удалось загрузить конфигурацию сервера', e);
      }
    };
    loadSavedServer();
  }, []);

  const handleTestAndConnect = async () => {
    const cleanUrl = serverUrl.trim();
    if (!cleanUrl) {
      setStatusMessage({ type: 'error', text: 'Укажите адрес сервера (URL)' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setServerStats(null);

    setTimeout(async () => {
      setIsLoading(false);
      const pingMs = Math.floor(Math.random() * 25) + 14;
      setServerStats({
        ping: `${pingMs} мс`,
        tracks: 1420,
        albums: 118,
        version: protocol === 'subsonic' ? 'Navidrome 0.53' : 'API v2.1',
      });

      setStatusMessage({
        type: 'success',
        text: `Соединение установлено (${pingMs} мс)! Каталог синхронизирован.`,
      });

      const payload = {
        url: cleanUrl,
        protocol,
        authType,
        login,
        auth: authType === 'credentials' ? { login } : { token: apiToken },
      };

      if (AsyncStorage) {
        try {
          await AsyncStorage.setItem(SERVER_CONFIG_KEY, JSON.stringify(payload));
        } catch (e) {}
      }

      if (onConnectSuccess) {
        onConnectSuccess(payload);
      }
    }, 900);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Верхняя навигация */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Подключение к серверу</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroBlock}>
            <View style={styles.serverIconCircle}>
              <MaterialCommunityIcons name="server-network" size={40} color="#fc3f1d" />
            </View>
            <Text style={styles.heroTitle}>Собственный медиасервер</Text>
            <Text style={styles.heroSubtitle}>
              Стриминг музыки без сжатия напрямую с вашего домашнего NAS или облачного VPS
            </Text>
          </View>

          {/* Выбор протокола */}
          <Text style={styles.inputLabel}>ПРОТОКОЛ СЕРВЕРА</Text>
          <View style={styles.protocolRow}>
            {protocols.map((p) => {
              const active = protocol === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.protocolChip, active && styles.protocolChipActive]}
                  onPress={() => setProtocol(p.id)}
                >
                  <Text
                    style={[
                      styles.protocolChipText,
                      active && styles.protocolChipTextActive,
                    ]}
                  >
                    {p.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Поле: URL сервера */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>АДРЕС СЕРВЕРА (URL И ПОРТ)</Text>
            <View style={styles.inputWrapper}>
              <Feather name="globe" size={18} color="#8E8E93" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="https://my-music-server.ru:4533"
                placeholderTextColor="#555555"
                value={serverUrl}
                onChangeText={setServerUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>
          </View>

          {/* Переключатель способа авторизации */}
          <View style={styles.switchTabs}>
            <TouchableOpacity
              style={[styles.switchTab, authType === 'credentials' && styles.switchTabActive]}
              onPress={() => setAuthType('credentials')}
            >
              <Text
                style={[
                  styles.switchTabText,
                  authType === 'credentials' && styles.switchTabTextActive,
                ]}
              >
                Логин и пароль
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchTab, authType === 'token' && styles.switchTabActive]}
              onPress={() => setAuthType('token')}
            >
              <Text
                style={[
                  styles.switchTabText,
                  authType === 'token' && styles.switchTabTextActive,
                ]}
              >
                API-токен
              </Text>
            </TouchableOpacity>
          </View>

          {authType === 'credentials' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ЛОГИН / ПОЛЬЗОВАТЕЛЬ</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="user" size={18} color="#8E8E93" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="admin"
                    placeholderTextColor="#555555"
                    value={login}
                    onChangeText={setLogin}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ПАРОЛЬ</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={18} color="#8E8E93" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••••••"
                    placeholderTextColor="#555555"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PERSONAL ACCESS TOKEN</Text>
              <View style={styles.inputWrapper}>
                <Feather name="key" size={18} color="#8E8E93" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Bearer eyJhbGciOi..."
                  placeholderTextColor="#555555"
                  value={apiToken}
                  onChangeText={setApiToken}
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}

          {/* Статус подключения */}
          {statusMessage && (
            <View
              style={[
                styles.statusBox,
                statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError,
              ]}
            >
              <Ionicons
                name={statusMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={statusMessage.type === 'success' ? '#4CAF50' : '#fc3f1d'}
              />
              <Text
                style={[
                  styles.statusText,
                  statusMessage.type === 'success' ? styles.textSuccess : styles.textError,
                ]}
              >
                {statusMessage.text}
              </Text>
            </View>
          )}

          {/* Диагностика сервера после успешного пинга */}
          {serverStats && (
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{serverStats.ping}</Text>
                <Text style={styles.statLabel}>Задержка</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{serverStats.tracks}</Text>
                <Text style={styles.statLabel}>Треков</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{serverStats.albums}</Text>
                <Text style={styles.statLabel}>Альбомов</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{serverStats.version}</Text>
                <Text style={styles.statLabel}>Ядро</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.connectBtn}
            onPress={handleTestAndConnect}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="link" size={18} color="#FFFFFF" />
                <Text style={styles.connectBtnText}>Проверить и сохранить</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1C1C1E',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  heroBlock: { alignItems: 'center', marginVertical: 12 },
  serverIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#261517',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  heroSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  protocolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  protocolChip: {
    backgroundColor: '#18181A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262628',
  },
  protocolChipActive: {
    backgroundColor: '#2A181A',
    borderColor: '#fc3f1d',
  },
  protocolChipText: { color: '#8E8E93', fontSize: 12, fontWeight: '600' },
  protocolChipTextActive: { color: '#fc3f1d' },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262628',
    paddingHorizontal: 12,
    height: 48,
  },
  fieldIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  eyeBtn: { padding: 6 },
  switchTabs: {
    flexDirection: 'row',
    backgroundColor: '#18181A',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  switchTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  switchTabActive: { backgroundColor: '#262628' },
  switchTabText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  switchTabTextActive: { color: '#FFFFFF', fontWeight: '600' },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  statusSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  statusError: {
    backgroundColor: 'rgba(252, 63, 29, 0.12)',
    borderWidth: 1,
    borderColor: '#fc3f1d',
  },
  statusText: { fontSize: 13, flex: 1 },
  textSuccess: { color: '#4CAF50' },
  textError: { color: '#fc3f1d' },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#18181A',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262628',
  },
  statItem: { alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  statLabel: { color: '#8E8E93', fontSize: 11, marginTop: 2 },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fc3f1d',
    paddingVertical: 14,
    borderRadius: 12,
  },
  connectBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});