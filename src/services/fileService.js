import * as DocumentPicker from 'expo-document-picker';
import { extractTrackMetadata } from './metadataService';

/**
 * Открывает системный проводник, считывает аудиофайлы и парсит их ID3-теги / обложки
 * @returns {Promise<Array>} Массив готовых треков для плеера
 */
export const pickLocalAudioFiles = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      // Полный спектр поддерживаемых аудиоформатов
      type: [
        'audio/mpeg',  // .mp3
        'audio/flac',  // .flac
        'audio/wav',   // .wav
        'audio/x-m4a', // .m4a
        'audio/aac',   // .aac
        'audio/*',     // фоллбек
      ],
      copyToCacheDirectory: true, // Копируем в песочницу для чтения парсером и воспроизведения
      multiple: true,             // Разрешаем выбирать пачку файлов
    });

    // Если пользователь отменил выбор
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    // Обрабатываем файлы параллельно для максимальной скорости импорта
    const trackPromises = result.assets.map(async (asset, index) => {
      const rawName = asset.name || 'Неизвестный трек';
      const cleanFallbackTitle = rawName.replace(/\.[^/.]+$/, '');

      // Извлекаем теги (ID3 / Vorbis Comments / MP4 tags)
      const meta = await extractTrackMetadata(asset.uri);

      // Приоритет отдаем названию из тегов, иначе берем имя файла
      const finalTitle = meta.title?.trim() ? meta.title.trim() : cleanFallbackTitle;
      const finalArtist = meta.artist?.trim() ? meta.artist.trim() : 'Локальный файл';

      return {
        id: `local_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
        title: finalTitle,
        artist: finalArtist,
        album: meta.album || 'Неизвестный альбом',
        durationSec: meta.duration || 0,
        // Вшитая обложка из файла (data:image/...) либо заглушка по названию
        cover: meta.cover || `https://picsum.photos/seed/${encodeURIComponent(cleanFallbackTitle)}/200/200`,
        uri: asset.uri,
        size: asset.size,
        mimeType: asset.mimeType,
        isLocal: true,
        liked: false,
      };
    });

    return await Promise.all(trackPromises);
  } catch (error) {
    console.error('Ошибка при выборе и парсинге файлов в fileService:', error);
    throw error;
  }
};