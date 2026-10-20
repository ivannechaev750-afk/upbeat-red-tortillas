import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключи хранения
const KEYS = {
  TRACKS: '@streamplayer_tracks',
  SEARCH_HISTORY: '@streamplayer_search_history',
  SERVER_CONFIG: '@streamplayer_server_config',
  SETTINGS: '@streamplayer_user_settings',
  LAST_SESSION: '@streamplayer_last_session',
};

export const StorageService = {
  // ---------------- ТРЕКИ И ПЛЕЙЛИСТЫ ----------------
  async getTracks() {
    try {
      const data = await AsyncStorage.getItem(KEYS.TRACKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Ошибка чтения треков из хранилища:', e);
      return [];
    }
  },

  async saveTracks(tracks) {
    try {
      await AsyncStorage.setItem(KEYS.TRACKS, JSON.stringify(tracks));
    } catch (e) {
      console.error('Ошибка сохранения треков:', e);
    }
  },

  // ---------------- ИСТОРИЯ ПОИСКА ----------------
  async getSearchHistory() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SEARCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  async addSearchQuery(query) {
    if (!query || !query.trim()) return [];
    try {
      const cleanQuery = query.trim();
      const current = await this.getSearchHistory();
      // Удаляем дубликат и ставим новый запрос на первое место (не более 15 штук)
      const updated = [cleanQuery, ...current.filter((item) => item !== cleanQuery)].slice(0, 15);
      await AsyncStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  async removeSearchQuery(queryToRemove) {
    try {
      const current = await this.getSearchHistory();
      const updated = current.filter((item) => item !== queryToRemove);
      await AsyncStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  async clearSearchHistory() {
    try {
      await AsyncStorage.removeItem(KEYS.SEARCH_HISTORY);
      return [];
    } catch (e) {
      return [];
    }
  },

  // ---------------- ПОДКЛЮЧЕНИЕ К СЕРВЕРУ ----------------
  async getServerConfig() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SERVER_CONFIG);
      return data ? JSON.parse(data) : { url: '', authType: 'token', token: '' };
    } catch (e) {
      return null;
    }
  },

  async saveServerConfig(config) {
    try {
      await AsyncStorage.setItem(KEYS.SERVER_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Ошибка сохранения конфигурации сервера:', e);
    }
  },

  // ---------------- ПОСЛЕДНЯЯ СЕССИЯ ПЛЕЕРА ----------------
  async saveLastSession(trackId, positionSec) {
    try {
      await AsyncStorage.setItem(
        KEYS.LAST_SESSION,
        JSON.stringify({ trackId, positionSec, timestamp: Date.now() })
      );
    } catch (e) {}
  },

  async getLastSession() {
    try {
      const data = await AsyncStorage.getItem(KEYS.LAST_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
};