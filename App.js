// App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioProvider, useAudio } from './src/services/AudioContext';

import HomeScreen from './HomeScreen.js';
import PlayerScreen from './PlayerScreen.js';
import LibraryScreen from './LibraryScreen';
import SettingsScreen from './SettingsScreen';
import SearchScreen from './SearchScreen';
import QueueScreen from './QueueScreen';
import AlbumDetailScreen from './AlbumDetailScreen';
import ServerConnectScreen from './ServerConnectScreen';

function MainNavigator() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Берем реальное состояние и методы из глобального AudioContext
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playTrack,
    queue,
  } = useAudio();

  // Переход между основными экранами с запоминанием истории
  const navigateTo = useCallback(
    (targetScreen) => {
      if (targetScreen !== currentScreen) {
        setPreviousScreen(currentScreen);
        setCurrentScreen(targetScreen);
      }
    },
    [currentScreen]
  );

  // Открытие полноэкранного плеера (при передаче нового трека — сразу запускаем его)
  const openPlayer = useCallback(
    (track = null) => {
      if (track && track.uri && track.id !== currentTrack?.id) {
        playTrack(track, queue);
      }
      if (currentScreen !== 'player') {
        setPreviousScreen(currentScreen);
        setCurrentScreen('player');
      }
    },
    [currentScreen, currentTrack?.id, playTrack, queue]
  );

  const closePlayer = useCallback(() => {
    setCurrentScreen(previousScreen || 'home');
  }, [previousScreen]);

  const openAlbum = useCallback(
    (albumData) => {
      setSelectedAlbum(albumData);
      setPreviousScreen(currentScreen);
      setCurrentScreen('album_detail');
    },
    [currentScreen]
  );

  // Поддержка аппаратной кнопки / жеста "Назад" на Android
  useEffect(() => {
    const onBackPress = () => {
      if (currentScreen === 'queue') {
        setCurrentScreen('player');
        return true;
      }
      if (currentScreen === 'server_connect') {
        setCurrentScreen('settings');
        return true;
      }
      if (['player', 'album_detail', 'settings'].includes(currentScreen)) {
        setCurrentScreen(previousScreen || 'home');
        return true;
      }
      if (['library', 'search'].includes(currentScreen)) {
        setCurrentScreen('home');
        return true;
      }
      return false; // На главном экране позволяем свернуть приложение
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [currentScreen, previousScreen]);

  // ЭКРАН 1: Полноэкранный плеер
  if (currentScreen === 'player') {
    return (
      <PlayerScreen
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onClose={closePlayer}
        onOpenQueue={() => setCurrentScreen('queue')}
      />
    );
  }

  // ЭКРАН 2: Очередь треков
  if (currentScreen === 'queue') {
    return (
      <QueueScreen
        currentTrack={currentTrack}
        onClose={() => setCurrentScreen('player')}
        onSelectTrack={(track) => {
          playTrack(track, queue);
        }}
      />
    );
  }

  // ЭКРАН 3: Детали альбома / плейлиста
  if (currentScreen === 'album_detail') {
    return (
      <AlbumDetailScreen
        album={selectedAlbum}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onClose={() => setCurrentScreen('home')}
        onOpenPlayer={openPlayer}
      />
    );
  }

  // ЭКРАН 4: Настройки
  if (currentScreen === 'settings') {
    return (
      <SettingsScreen
        onClose={() => setCurrentScreen('home')}
        onOpenServerConnect={() => setCurrentScreen('server_connect')}
      />
    );
  }

  // ЭКРАН 5: Подключение к серверу
  if (currentScreen === 'server_connect') {
    return (
      <ServerConnectScreen
        onClose={() => setCurrentScreen('settings')}
        onConnectSuccess={() => setCurrentScreen('settings')}
      />
    );
  }

  // ЭКРАН 6: Моя коллекция
  if (currentScreen === 'library') {
    return (
      <LibraryScreen
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onOpenPlayer={openPlayer}
        onGoHome={() => navigateTo('home')}
        onGoSearch={() => navigateTo('search')}
      />
    );
  }

  // ЭКРАН 7: Поиск
  if (currentScreen === 'search') {
    return (
      <SearchScreen
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onOpenPlayer={openPlayer}
        onGoHome={() => navigateTo('home')}
        onGoLibrary={() => navigateTo('library')}
      />
    );
  }

  // ЭКРАН 8: Главная (по умолчанию)
  return (
    <HomeScreen
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      onTogglePlay={togglePlay}
      onOpenPlayer={openPlayer}
      onOpenLibrary={() => navigateTo('library')}
      onOpenSettings={() => navigateTo('settings')}
      onOpenSearch={() => navigateTo('search')}
      onOpenAlbum={openAlbum}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <MainNavigator />
      </AudioProvider>
    </SafeAreaProvider>
  );
}