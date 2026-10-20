import React, { useState } from 'react';
import { AudioProvider } from './src/services/AudioContext';
import HomeScreen from './HomeScreen';
import PlayerScreen from './PlayerScreen';
import LibraryScreen from './LibraryScreen';
import SettingsScreen from './SettingsScreen';
import SearchScreen from './SearchScreen';
import QueueScreen from './QueueScreen';
import AlbumDetailScreen from './AlbumDetailScreen';
import ServerConnectScreen from './ServerConnectScreen';

// Начальный трек по умолчанию
const initialTrack = {
  id: '1',
  title: 'Sunset Vibes',
  artist: 'Digital Horizon',
  cover: 'https://picsum.photos/seed/sunset/600/600',
  duration: '3:45',
};

function MainNavigator() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Глобальное состояние текущего воспроизведения
  const [currentTrack, setCurrentTrack] = useState(initialTrack);
  const [isPlaying, setIsPlaying] = useState(false);

  // Переход в полноэкранный плеер с сохранением предыдущего экрана
  const openPlayer = (track = null) => {
    if (track && track.title) {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
    setPreviousScreen(currentScreen);
    setCurrentScreen('player');
  };

  // Закрытие плеера (возврат туда, откуда открыли)
  const closePlayer = () => {
    setCurrentScreen(previousScreen || 'home');
  };

  const openAlbum = (albumData) => {
    setSelectedAlbum(albumData);
    setCurrentScreen('album_detail');
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

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
          setCurrentTrack(track);
          setIsPlaying(true);
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
        onGoHome={() => setCurrentScreen('home')}
        onGoSearch={() => setCurrentScreen('search')}
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
        onGoHome={() => setCurrentScreen('home')}
        onGoLibrary={() => setCurrentScreen('library')}
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
      onOpenLibrary={() => setCurrentScreen('library')}
      onOpenSettings={() => setCurrentScreen('settings')}
      onOpenSearch={() => setCurrentScreen('search')}
      onOpenAlbum={openAlbum}
    />
  );
}

export default function App() {
  return (
    <AudioProvider>
      <MainNavigator />
    </AudioProvider>
  );
}