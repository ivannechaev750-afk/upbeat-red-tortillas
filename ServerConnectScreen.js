import React, { useState } from 'react';
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

export default function ServerConnectScreen({ onClose, onConnectSuccess }) {
  const [authType, setAuthType] = useState('credentials'); // 'credentials' | 'token'
  const [serverUrl, setServerUrl] = useState('https://nas.home.local:8080');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleTestAndConnect = () => {
    if (!serverUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Укажите адрес сервера' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    // Имитация сетевого запроса к API сервера (ping/auth)
    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage({ type: 'success', text: 'Соединение установлено! Библиотека синхронизирована.' });
      
      if (onConnectSuccess) {
        onConnectSuccess({
          url: serverUrl,
          authType,
          auth: authType === 'credentials' ? { login } : { token: apiToken },
        });
      }
    }, 1200);
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Иконка статуса */}
          <View style={styles.heroBlock}>
            <View style={styles.serverIconCircle}>
              <MaterialCommunityIcons name="server-network" size={40} color="#fc3f1d" />
            </View>
            <Text style={styles.heroTitle}>Собственный медиасервер</Text>
            <Text style={styles.heroSubtitle}>
              Поддерживаются персональные серверы (FastAPI, Node.js), а также протоколы Subsonic / Navidrome
            </Text>
          </View>

          {/* Поле: URL сервера */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>АДРЕС СЕРВЕРА (URL)</Text>
            <View style={styles.inputWrapper}>
              <Feather name="globe" size={18} color="#8E8E93" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="https://my-music-server.ru"
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
              <Text style={[styles.switchTabText, authType === 'credentials' && styles.switchTabTextActive]}>
                Логин и пароль
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchTab, authType === 'token' && styles.switchTabActive]}
              onPress={() => setAuthType('token')}
            >
              <Text style={[styles.switchTabText, authType === 'token' && styles.switchTabTextActive]}>
                API-токен
              </Text>
            </TouchableOpacity>
          </View>

          {/* Поля в зависимости от способа */}
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
                  placeholder="Bearer eydfa9..."
                  placeholderTextColor="#555555"
                  value={apiToken}
                  onChangeText={setApiToken}
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}

          {/* Сообщение об ошибке или успехе */}
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

          {/* Кнопка отправки */}
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
                <Text style={styles.connectBtnText}>Проверить и подключить</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1C1C1E',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroBlock: {
    alignItems: 'center',
    marginVertical: 16,
  },
  serverIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#261517',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
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
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  switchTabs: {
    flexDirection: 'row',
    backgroundColor: '#18181A',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  switchTabActive: {
    backgroundColor: '#262628',
  },
  switchTabText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  switchTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
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
  statusText: {
    fontSize: 13,
    flex: 1,
  },
  textSuccess: {
    color: '#4CAF50',
  },
  textError: {
    color: '#fc3f1d',
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fc3f1d',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});