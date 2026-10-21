// ImportModal.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  requestAudioPermissions,
  scanDeviceMusicLibrary,
  pickLocalAudioFiles,
  openAppSettings,
} from './src/services/fileService';

export default function ImportModal({ visible, onClose, onImportSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [permissionState, setPermissionState] = useState({
    granted: false,
    canAskAgain: true,
    checked: false,
  });
  const [statusMessage, setStatusMessage] = useState(null);

  // При открытии модалки проверяем статус разрешения
  useEffect(() => {
    if (visible) {
      setStatusMessage(null);
      setProgressText('');
    }
  }, [visible]);

  const onProgress = (current, total) => {
    setProgressText(`Чтение тегов и обложек: ${current} из ${total}`);
  };

  // Вариант 1: Автосканирование всей музыки на телефоне (с запросом разрешения)
  const handleScanDevice = async () => {
    setStatusMessage(null);
    setIsLoading(true);
    setProgressText('Запрос разрешения на доступ к файлам...');

    try {
      const perm = await requestAudioPermissions();
      setPermissionState({
        granted: perm.granted,
        canAskAgain: perm.canAskAgain,
        checked: true,
      });

      if (!perm.granted) {
        setIsLoading(false);
        setStatusMessage({
          type: 'error',
          text: perm.canAskAgain
            ? 'Для поиска музыки необходимо разрешить доступ к аудиофайлам.'
            : 'Доступ к файлам запрещён в настройках телефона. Разрешите доступ к «Музыке и аудио» вручную.',
        });
        return;
      }

      setProgressText('Поиск аудиофайлов в памяти телефона...');
      const tracks = await scanDeviceMusicLibrary(onProgress);

      setIsLoading(false);
      if (!tracks || tracks.length === 0) {
        setStatusMessage({
          type: 'info',
          text: 'В стандартных папках музыка не найдена. Попробуйте выбрать файлы вручную через проводник.',
        });
        return;
      }

      onImportSuccess?.(tracks);
      onClose();
    } catch (err) {
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: 'Не удалось просканировать память. Попробуйте выбрать файлы через проводник.',
      });
    }
  };

  // Вариант 2: Выбор конкретных файлов через системный проводник (DocumentPicker)
  const handlePickFromExplorer = async () => {
    setStatusMessage(null);
    setIsLoading(true);
    setProgressText('Открытие проводника...');

    try {
      const tracks = await pickLocalAudioFiles(onProgress);
      setIsLoading(false);

      if (!tracks || tracks.length === 0) {
        return; // Пользователь просто закрыл проводник
      }

      onImportSuccess?.(tracks);
      onClose();
    } catch (err) {
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: 'Ошибка чтения выбранных файлов.',
      });
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isLoading}>
            <Ionicons name="close" size={22} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="folder-music-outline" size={38} color="#fc3f1d" />
          </View>

          <Text style={styles.modalTitle}>Импорт своей музыки</Text>
          <Text style={styles.modalSubtitle}>
            Разрешите доступ к памяти устройства для автоматического поиска песен или выберите аудиофайлы через проводник
          </Text>

          {/* Поддерживаемые форматы */}
          <View style={styles.badgeRow}>
            {['.MP3', '.FLAC', '.WAV', '.M4A', '.AAC'].map((ext) => (
              <View key={ext} style={styles.formatBadge}>
                <Text style={styles.badgeText}>{ext}</Text>
              </View>
            ))}
          </View>

          {/* Уведомление о статусе разрешения или ошибки */}
          {statusMessage && (
            <View
              style={[
                styles.alertBox,
                statusMessage.type === 'error' ? styles.alertError : styles.alertInfo,
              ]}
            >
              <Ionicons
                name={statusMessage.type === 'error' ? 'lock-closed-outline' : 'information-circle-outline'}
                size={18}
                color={statusMessage.type === 'error' ? '#fc3f1d' : '#64B5F6'}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertText}>{statusMessage.text}</Text>
                {!permissionState.canAskAgain && statusMessage.type === 'error' && (
                  <TouchableOpacity onPress={openAppSettings} style={styles.settingsLinkBtn}>
                    <Text style={styles.settingsLinkText}>Открыть настройки разрешений →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Индикатор загрузки и прогресса */}
          {isLoading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="large" color="#fc3f1d" />
              <Text style={styles.progressLabel}>{progressText}</Text>
            </View>
          ) : (
            <>
              {/* Кнопка 1: Сканировать память (с запросом разрешения ОС) */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleScanDevice}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Разрешить и найти всю музыку</Text>
              </TouchableOpacity>

              {/* Кнопка 2: Открыть системный проводник */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePickFromExplorer}
                activeOpacity={0.8}
              >
                <Feather name="folder" size={18} color="#FFFFFF" />
                <Text style={styles.secondaryButtonText}>Выбрать файлы в проводнике</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading}>
            <Text style={styles.cancelBtnText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#1C1C1E',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#2A1F21',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  formatBadge: {
    backgroundColor: '#262628',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B3B3B3',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  alertError: {
    backgroundColor: 'rgba(252, 63, 29, 0.12)',
    borderWidth: 1,
    borderColor: '#fc3f1d',
  },
  alertInfo: {
    backgroundColor: 'rgba(100, 181, 246, 0.12)',
    borderWidth: 1,
    borderColor: '#64B5F6',
  },
  alertText: {
    color: '#EAEAEA',
    fontSize: 12,
    lineHeight: 17,
  },
  settingsLinkBtn: {
    marginTop: 6,
  },
  settingsLinkText: {
    color: '#fc3f1d',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBlock: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 12,
  },
  progressLabel: {
    color: '#CCCCCC',
    fontSize: 13,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fc3f1d',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2A2A2D',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 6,
  },
  cancelBtnText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});