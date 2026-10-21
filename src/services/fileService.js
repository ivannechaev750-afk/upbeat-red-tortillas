import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Linking, Platform } from 'react-native';
import { extractTrackMetadata, detectFormatBadge } from './metadataService';

// Безопасное подключение expo-media-library (чтобы не падало в веб-превью Snack)
let MediaLibrary = null;
try {
  MediaLibrary = require('expo-media-library');
} catch (e) {
  MediaLibrary = null;
}

const LOCAL_MUSIC_DIR = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}local_music/`
  : null;

/**
 * Создает постоянную папку для хранения импортированной музыки
 */
const ensureMusicDirExists = async () => {
  if (!LOCAL_MUSIC_DIR) return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(LOCAL_MUSIC_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOCAL_MUSIC_DIR, { intermediates: true });
    }
  } catch (e) {
    console.warn('Не удалось создать директорию для музыки:', e.message);
  }
};

/**
 * Копирует аудиофайл из временного кэша в постоянную память приложения
 */
const persistAudioFile = async (sourceUri, fileName) => {
  if (!LOCAL_MUSIC_DIR || !sourceUri) return sourceUri;
  try {
    await ensureMusicDirExists();
    const safeName = (fileName || `track_${Date.now()}.mp3`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const destUri = `${LOCAL_MUSIC_DIR}${Date.now()}_${safeName}`;
    await FileSystem.copyAsync({ from: sourceUri, to: destUri });
    return destUri;
  } catch (e) {
    return sourceUri;
  }
};

/**
 * Форматирует секунды в строку ММ:СС
 */
export const formatDuration = (sec) => {
  if (!sec || isNaN(sec) || sec <= 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

/**
 * Приводит любой объект трека к единому формату плеера
 */
export const normalizeTrack = (raw = {}, index = 0) => {
  const cleanTitle = (raw.title || raw.name || `Аудиозапись #${index + 1}`).trim();
  const durationSec = Math.round(
    raw.durationSec || (typeof raw.duration === 'number' ? raw.duration : 0)
  );

  return {
    id: String(raw.id || `local_${Date.now()}_${index}`),
    title: cleanTitle,
    artist: (raw.artist || 'Память устройства').trim(),
    album: raw.album || 'Локальная коллекция',
    durationSec,
    duration:
      typeof raw.duration === 'string' && raw.duration.includes(':')
        ? raw.duration
        : formatDuration(durationSec),
    cover:
      raw.cover ||
      raw.artwork ||
      `https://picsum.photos/seed/${encodeURIComponent(cleanTitle)}/300/300`,
    uri: raw.uri || raw.url || '',
    format: raw.format || detectFormatBadge(raw.uri || '', raw.mimeType),
    size: raw.size || null,
    mimeType: raw.mimeType || 'audio/mpeg',
    isLocal: true,
    liked: Boolean(raw.liked),
  };
};

/**
 * 1. Запрос системного разрешения на чтение аудиофайлов из памяти телефона
 */
export const requestAudioPermissions = async () => {
  if (!MediaLibrary || !MediaLibrary.requestPermissionsAsync) {
    return { granted: true, canAskAgain: true, status: 'granted', isFallback: true };
  }

  try {
    const current = await MediaLibrary.getPermissionsAsync();
    if (current.granted) {
      return {
        granted: true,
        canAskAgain: current.canAskAgain ?? true,
        status: current.status,
      };
    }

    const requested = await MediaLibrary.requestPermissionsAsync();
    return {
      granted: requested.granted,
      canAskAgain: requested.canAskAgain ?? true,
      status: requested.status,
    };
  } catch (error) {
    console.warn('Ошибка запроса разрешения MediaLibrary:', error.message);
    return { granted: false, canAskAgain: true, status: 'error' };
  }
};

/**
 * Открывает системные настройки приложения
 */
export const openAppSettings = () => {
  if (Linking.openSettings) {
    Linking.openSettings();
  }
};

/**
 * 2. Автоматическое сканирование памяти устройства на наличие музыкальных файлов
 */
export const scanDeviceMusicLibrary = async (onProgress) => {
  const perm = await requestAudioPermissions();
  if (!perm.granted) {
    const err = new Error('PERMISSION_DENIED');
    err.canAskAgain = perm.canAskAgain;
    throw err;
  }

  if (MediaLibrary && !perm.isFallback) {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 500,
        sortBy: [MediaLibrary.SortBy.modificationTime],
      });

      const validAudioAssets = (media.assets || []).filter(
        (asset) => !asset.duration || asset.duration >= 5
      );

      const scannedTracks = [];
      const total = validAudioAssets.length;

      for (let i = 0; i < total; i++) {
        const asset = validAudioAssets[i];
        onProgress?.(i + 1, total);

        const rawName = asset.filename || `Track_${i + 1}.mp3`;
        const cleanFallbackTitle = rawName.replace(/\.[^/.]+$/, '');

        let playableUri = asset.uri;
        try {
          if (Platform.OS === 'ios') {
            const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
            if (assetInfo?.localUri) playableUri = assetInfo.localUri;
          }
        } catch (e) {}

        const meta = await extractTrackMetadata(playableUri);

        const finalTitle = meta.title?.trim() ? meta.title.trim() : cleanFallbackTitle;
        const finalArtist =
          meta.artist && meta.artist !== 'Неизвестный исполнитель'
            ? meta.artist
            : 'Память устройства';

        scannedTracks.push(
          normalizeTrack(
            {
              id: `media_${asset.id}`,
              title: finalTitle,
              artist: finalArtist,
              album: meta.album || 'Память телефона',
              durationSec: Math.round(asset.duration || meta.duration || 0),
              cover:
                meta.cover ||
                `https://picsum.photos/seed/${encodeURIComponent(cleanFallbackTitle)}/300/300`,
              uri: playableUri,
              format: meta.format || detectFormatBadge(rawName),
              isLocal: true,
              liked: false,
            },
            i
          )
        );
      }

      return scannedTracks;
    } catch (error) {
      console.error('Ошибка сканирования MediaLibrary:', error);
      throw error;
    }
  }

  return await pickLocalAudioFiles(onProgress);
};

/**
 * 3. Ручной выбор файлов через системный проводник (DocumentPicker)
 */
export const pickLocalAudioFiles = async (onProgress) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'audio/mpeg',
        'audio/flac',
        'audio/wav',
        'audio/x-m4a',
        'audio/mp4',
        'audio/aac',
        'audio/ogg',
        'audio/*',
      ],
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    const importedTracks = [];
    const total = result.assets.length;

    for (let i = 0; i < total; i++) {
      const asset = result.assets[i];
      onProgress?.(i + 1, total);

      const rawName = asset.name || `Аудиозапись ${i + 1}`;
      const cleanFallbackTitle = rawName.replace(/\.[^/.]+$/, '');

      const permanentUri = await persistAudioFile(asset.uri, rawName);
      const meta = await extractTrackMetadata(permanentUri);

      const finalTitle = meta.title?.trim() ? meta.title.trim() : cleanFallbackTitle;
      const finalArtist =
        meta.artist && meta.artist !== 'Неизвестный исполнитель'
          ? meta.artist
          : 'Память телефона';

      const track = normalizeTrack(
        {
          id: `file_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          title: finalTitle,
          artist: finalArtist,
          album: meta.album,
          durationSec: meta.duration || 0,
          cover:
            meta.cover ||
            `https://picsum.photos/seed/${encodeURIComponent(cleanFallbackTitle)}/300/300`,
          uri: permanentUri,
          size: asset.size,
          mimeType: asset.mimeType,
          format: meta.format || detectFormatBadge(rawName, asset.mimeType),
          isLocal: true,
          liked: false,
        },
        i
      );

      importedTracks.push(track);
    }

    return importedTracks;
  } catch (error) {
    console.error('Ошибка при выборе файлов через DocumentPicker:', error);
    return [];
  }
};