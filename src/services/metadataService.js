import * as FileSystem from 'expo-file-system';
import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';

// Регистрация Buffer для работы парсера в окружении React Native
global.Buffer = global.Buffer || Buffer;

/**
 * Извлекает метаданные и вшитую обложку из локального аудиофайла по его URI
 * @param {string} fileUri Путь к файлу (file:///...)
 * @returns {Promise<Object>} Распарсенные метаданные трека
 */
export const extractTrackMetadata = async (fileUri) => {
  try {
    // Считываем файл как base64 через файловую систему Expo
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Преобразуем base64 в бинарный Uint8Array Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Парсим аудио-буфер
    const metadata = await mm.parseBuffer(buffer, {
      mimeType: 'audio/mpeg',
    });

    const common = metadata.common || {};
    const format = metadata.format || {};

    // Извлечение обложки из тега APIC / Picture
    let coverUri = null;
    if (common.picture && common.picture.length > 0) {
      const picture = common.picture[0];
      const base64Cover = Buffer.from(picture.data).toString('base64');
      coverUri = `data:${picture.format};base64,${base64Cover}`;
    }

    return {
      title: common.title || null,
      artist: common.artist || common.albumartist || 'Неизвестный исполнитель',
      album: common.album || 'Неизвестный альбом',
      year: common.year || null,
      duration: format.duration ? Math.round(format.duration) : null,
      cover: coverUri,
    };
  } catch (error) {
    console.warn(`Не удалось прочитать ID3 теги из ${fileUri}:`, error.message);
    // Возвращаем дефолтные значения при ошибке поврежденного заголовка
    return {
      title: null,
      artist: 'Неизвестный исполнитель',
      album: 'Неизвестный альбом',
      year: null,
      duration: null,
      cover: null,
    };
  }
};