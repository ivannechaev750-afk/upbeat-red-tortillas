// src/services/audioService.js

// Безопасное определение доступного аудио-движка
let TrackPlayer = null;
let Capability = null;
let AppKilledPlaybackBehavior = null;

try {
  const rntp = require('react-native-track-player');
  if (rntp && rntp.default && typeof rntp.default.setupPlayer === 'function') {
    TrackPlayer = rntp.default;
    Capability = rntp.Capability;
    AppKilledPlaybackBehavior = rntp.AppKilledPlaybackBehavior;
  }
} catch (e) {
  TrackPlayer = null;
}

let createAudioPlayer = null;
try {
  createAudioPlayer = require('expo-audio').createAudioPlayer;
} catch (e) {
  createAudioPlayer = null;
}

class HybridAudioEngine {
  constructor() {
    this.useNativeTrackPlayer = false;
    this.expoPlayer = null;
    this.isInitialized = false;
    this.playbackRate = 1.0;
  }

  async setupPlayer() {
    if (this.isInitialized) return true;

    if (TrackPlayer) {
      try {
        await TrackPlayer.getActiveTrackIndex();
        this.useNativeTrackPlayer = true;
        this.isInitialized = true;
        return true;
      } catch {
        try {
          await TrackPlayer.setupPlayer();
          await TrackPlayer.updateOptions({
            android: {
              appKilledPlaybackBehavior:
                AppKilledPlaybackBehavior?.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
              Capability?.Play,
              Capability?.Pause,
              Capability?.SkipToNext,
              Capability?.SkipToPrevious,
              Capability?.SeekTo,
            ].filter(Boolean),
            compactCapabilities: [
              Capability?.Play,
              Capability?.Pause,
              Capability?.SkipToNext,
            ].filter(Boolean),
          });
          this.useNativeTrackPlayer = true;
          this.isInitialized = true;
          return true;
        } catch (err) {
          // Если нативный модуль не слинкован (например, в Expo Go / Snack), переключаемся на expo-audio
          this.useNativeTrackPlayer = false;
        }
      }
    }

    this.isInitialized = true;
    return true;
  }

  async loadAndPlay(track) {
    if (!track || !track.uri) return false;
    await this.setupPlayer();

    if (this.useNativeTrackPlayer && TrackPlayer) {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: String(track.id),
        url: track.uri,
        title: track.title || 'Без названия',
        artist: track.artist || 'Неизвестный исполнитель',
        artwork: track.cover,
        duration: track.durationSec || 0,
      });
      if (this.playbackRate !== 1.0 && TrackPlayer.setRate) {
        await TrackPlayer.setRate(this.playbackRate);
      }
      await TrackPlayer.play();
      return true;
    }

    // Фоллбэк на expo-audio
    if (createAudioPlayer) {
      if (this.expoPlayer) {
        try {
          this.expoPlayer.pause();
          this.expoPlayer.release();
        } catch (e) {}
      }
      this.expoPlayer = createAudioPlayer({ uri: track.uri });
      if (this.playbackRate !== 1.0 && 'playbackRate' in this.expoPlayer) {
        this.expoPlayer.playbackRate = this.playbackRate;
      }
      this.expoPlayer.play();
      return true;
    }

    return false;
  }

  async play() {
    if (this.useNativeTrackPlayer && TrackPlayer) {
      await TrackPlayer.play();
    } else if (this.expoPlayer) {
      this.expoPlayer.play();
    }
  }

  async pause() {
    if (this.useNativeTrackPlayer && TrackPlayer) {
      await TrackPlayer.pause();
    } else if (this.expoPlayer) {
      this.expoPlayer.pause();
    }
  }

  async seekTo(seconds) {
    if (this.useNativeTrackPlayer && TrackPlayer) {
      await TrackPlayer.seekTo(seconds);
    } else if (this.expoPlayer) {
      this.expoPlayer.seekTo(seconds);
    }
  }

  async setRate(rate = 1.0) {
    this.playbackRate = rate;
    if (this.useNativeTrackPlayer && TrackPlayer?.setRate) {
      await TrackPlayer.setRate(rate);
    } else if (this.expoPlayer) {
      try {
        this.expoPlayer.playbackRate = rate;
      } catch (e) {}
    }
  }

  async getProgress() {
    if (this.useNativeTrackPlayer && TrackPlayer?.getProgress) {
      try {
        const prog = await TrackPlayer.getProgress();
        return {
          position: prog.position || 0,
          duration: prog.duration || 0,
        };
      } catch (e) {
        return { position: 0, duration: 0 };
      }
    }

    if (this.expoPlayer) {
      return {
        position: this.expoPlayer.currentTime || 0,
        duration: this.expoPlayer.duration || 0,
      };
    }

    return { position: 0, duration: 0 };
  }

  async release() {
    if (this.expoPlayer) {
      try {
        this.expoPlayer.pause();
        this.expoPlayer.release();
      } catch (e) {}
      this.expoPlayer = null;
    }
  }
}

export const audioEngine = new HybridAudioEngine();

// Сохранение обратной совместимости с прежними экспортами
export const setupPlayer = () => audioEngine.setupPlayer();
export const playTrack = (track) => audioEngine.loadAndPlay(track);