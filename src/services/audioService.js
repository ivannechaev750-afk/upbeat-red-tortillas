import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';

// Инициализация плеера (вызывается один раз при старте приложения)
export const setupPlayer = async () => {
  let isSetup = false;
  try {
    // Проверяем, не инициализирован ли уже плеер
    await TrackPlayer.getActiveTrackIndex();
    isSetup = true;
  } catch {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
      notificationCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
    });
    isSetup = true;
  }
  return isSetup;
};

// Запуск конкретного трека
export const playTrack = async (track) => {
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: String(track.id),
    url: track.uri, // ссылка на ваш сервер или локальный file:///
    title: track.title,
    artist: track.artist,
    artwork: track.cover,
    duration: track.duration,
  });
  await TrackPlayer.play();
};