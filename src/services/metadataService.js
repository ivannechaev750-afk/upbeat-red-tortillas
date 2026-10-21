// src/services/metadataService.js
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

global.Buffer = global.Buffer || Buffer;

let mm = null;
try {
  mm = require('music-metadata-browser');
} catch (e) {
  mm = null;
}

// Читаем максимум 384 КБ с начала файла для извлечения метаданных и обложек без переполнения памяти
const MAX_HEADER_BYTES = 384 * 1024;

/**
 * Определяет MIME-тип по расширению файла
 */
export const detectMimeType = (uri = '') => {
  const ext = uri.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'flac':
      return 'audio/flac';
    case 'wav':
      return 'audio/wav';
    case 'm4a':
    case 'mp4':
      return 'audio/mp4';
    case 'aac':
      return 'audio/aac';
    case 'ogg':
      return 'audio/ogg';
    default:
      return 'audio/mpeg';
  }
};

/**
 * Определяет читаемое название формата для бейджей в UI
 */
export const detectFormatBadge = (uri = '', mimeType = '') => {
  const ext = uri.split('.').pop()?.toUpperCase();
  if (['MP3', 'FLAC', 'WAV', 'M4A', 'AAC', 'OGG'].includes(ext)) {
    return ext;
  }
  if (mimeType.includes('flac')) return 'FLAC';
  if (mimeType.includes('wav')) return 'WAV';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'M4A';
  return 'MP3';
};

/**
 * Сохраняет бинарную обложку в кэш устройства и возвращает короткий file:// URI
 */
const cacheCoverImage = async (picture) => {
  try {
    if (!picture || !picture.data) return null;
    const base64Cover = Buffer.from(picture.data).toString('base64');
    const ext = picture.format?.includes('png') ? 'png' : 'jpg';

    if (FileSystem.cacheDirectory) {
      const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, base64Cover, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return fileUri;
    }

    return `data:${picture.format || 'image/jpeg'};base64,${base64Cover}`;
  } catch (e) {
    return null;
  }
};

/**
 * Извлекает метаданные и вшитую обложку из локального аудиофайла по его URI
 * @param {string} fileUri Путь к файлу (file:///...)
 * @returns {Promise<Object>} Распарсенные метаданные трека
 */
export const extractTrackMetadata = async (fileUri) => {
  const fallback = {
    title: null,
    artist: 'Неизвестный исполнитель',
    album: 'Неизвестный альбом',
    year: null,
    duration: null,
    cover: null,
    format: detectFormatBadge(fileUri),
  };

  if (!mm || !fileUri) {
    return fallback;
  }

  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) return fallback;

    const readLength = info.size
      ? Math.min(info.size, MAX_HEADER_BYTES)
      : MAX_HEADER_BYTES;

    // Читаем только начало файла (заголовок с тегами)
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
      position: 0,
      length: readLength,
    });

    const buffer = Buffer.from(base64Data, 'base64');
    const mimeType = detectMimeType(fileUri);

    const metadata = await mm.parseBuffer(
      buffer,
      { mimeType, size: info.size || buffer.length },
      { duration: true, skipPostHeaders: true }
    );

    const common = metadata.common || {};
    const format = metadata.format || {};

    let coverUri = null;
    if (common.picture && common.picture.length > 0) {
      coverUri = await cacheCoverImage(common.picture[0]);
    }

    return {
      title: common.title?.trim() || null,
      artist:
        common.artist?.trim() ||
        common.albumartist?.trim() ||
        'Неизвестный исполнитель',
      album: common.album?.trim() || 'Неизвестный альбом',
      year: common.year || null,
      duration: format.duration ? Math.round(format.duration) : null,
      cover: coverUri,
      format: detectFormatBadge(fileUri, mimeType),
    };
  } catch (error) {
    console.warn(`Пропуск чтения ID3-тегов для ${fileUri}:`, error.message);
    return fallback;
  }
};