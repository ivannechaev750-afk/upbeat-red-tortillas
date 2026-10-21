// src/services/storageService.js
let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

// Фоллбэк в оперативной памяти, если AsyncStorage недоступен (например, в веб-песочнице)
const memoryStore = {};

const safeGet = async (key) => {
  if (AsyncStorage) {
    return await AsyncStorage.getItem(key);
  }
  return memoryStore[key] || null;
};

const safeSet = async (key, value) => {
  if (AsyncStorage) {
    await AsyncStorage.setItem(key, value);
  } else {
    memoryStore[key] = value;
  }
};

const safeRemove = async (key) => {
  if (AsyncStorage) {
    await AsyncStorage.removeItem(key);
  } else {
    delete memoryStore[key];
  }
};

// Единые ключи хранения (синхронизированы со всеми экранами)
export const STORAGE_KEYS = {
  TRACKS: '@streamplayer_library_tracks',
  LEGACY_TRACKS: '@streamplayer_tracks',
  SEARCH_HISTORY: '@streamplayer_search_history',
  SERVER_CONFIG: '@streamplayer_server_config',
  SETTINGS: '@streamplayer_app_settings',
  LAST_SESSION: '@streamplayer_last_session',
};

const DEFAULT_SETTINGS = {
  offlineMode: false,
  losslessAudio: true,
  normalizeVolume: false,
  autoSync: true,
  eqIndex: 0,
  crossfade: 3,
};

const DEFAULT_SERVER_CONFIG = {
  url: 'https://nas.home.local:8080',
  protocol: 'subsonic',
  authType: 'credentials',
  login: 'admin',
  token: '',
  connected: false,
};

export const StorageService = {
  // ---------------- ТРЕКИ И МЕДИАТЕКА ----------------
  async getTracks() {
    try {
      let data = await safeGet(STORAGE_KEYS.TRACKS);
      // Миграция со старого ключа, если данные были сохранены туда
      if (!data) {
        data = await safeGet(STORAGE_KEYS.LEGACY_TRACKS);
      }
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Ошибка чтения треков из хранилища:', e);
      return [];
    }
  },

  async saveTracks(tracks) {
    try {
      if (!Array.isArray(tracks)) return;
      await safeSet(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
    } catch (e) {
      console.error('Ошибка сохранения треков:', e);
    }
  },

  async upsertTracks(newTracks) {
    try {
      const current = await this.getTracks();
      const map = new Map();
      [...newTracks, ...current].forEach((t) => {
        if (t && t.id) map.set(t.id, t);
      });
      const merged = Array.from(map.values());
      await this.saveTracks(merged);
      return merged;
    } catch (e) {
      console.error('Ошибка обновления списка треков:', e);
      return [];
    }
  },

  // ---------------- ИСТОРИЯ ПОИСКА ----------------
  async getSearchHistory() {
    try {
      const data = await safeGet(STORAGE_KEYS.SEARCH_HISTORY);
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
      const updated = [
        cleanQuery,
        ...current.filter((item) => item.toLowerCase() !== cleanQuery.toLowerCase()),
      ].slice(0, 15);
      await safeSet(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  async removeSearchQuery(queryToRemove) {
    try {
      const current = await this.getSearchHistory();
      const updated = current.filter((item) => item !== queryToRemove);
      await safeSet(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  async clearSearchHistory() {
    try {
      await safeRemove(STORAGE_KEYS.SEARCH_HISTORY);
      return [];
    } catch (e) {
      return [];
    }
  },

  // ---------------- ПОДКЛЮЧЕНИЕ К СЕРВЕРУ ----------------
  async getServerConfig() {
    try {
      const data = await safeGet(STORAGE_KEYS.SERVER_CONFIG);
      return data ? { ...DEFAULT_SERVER_CONFIG, ...JSON.parse(data) } : DEFAULT_SERVER_CONFIG;
    } catch (e) {
      return DEFAULT_SERVER_CONFIG;
    }
  },

  async saveServerConfig(config) {
    try {
      const current = await this.getServerConfig();
      const merged = { ...current, ...config };
      await safeSet(STORAGE_KEYS.SERVER_CONFIG, JSON.stringify(merged));
      return merged;
    } catch (e) {
      console.error('Ошибка сохранения конфигурации сервера:', e);
      return config;
    }
  },

  // ---------------- НАСТРОЙКИ ПРИЛОЖЕНИЯ ----------------
  async getSettings() {
    try {
      const data = await safeGet(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(patch) {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...patch };
      await safeSet(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Ошибка сохранения настроек:', e);
      return patch;
    }
  },

  // ---------------- ПОСЛЕДНЯЯ СЕССИЯ ПЛЕЕРА ----------------
  async saveLastSession(trackId, positionSec = 0) {
    try {
      if (!trackId) return;
      await safeSet(
        STORAGE_KEYS.LAST_SESSION,
        JSON.stringify({ trackId, positionSec, timestamp: Date.now() })
      );
    } catch (e) {}
  },

  async getLastSession() {
    try {
      const data = await safeGet(STORAGE_KEYS.LAST_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
};