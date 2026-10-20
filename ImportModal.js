import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ImportModal({ visible, onClose, onImportSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePickFiles = () => {
    setIsLoading(true);

    // Симуляция сканирования памяти устройства (стабильно работает в Snack)
    setTimeout(() => {
      const importedTracks = [
        {
          id: 'local_' + Date.now() + '_1',
          title: 'Subwoofer Lullaby',
          artist: 'Память устройства',
          cover: 'https://picsum.photos/seed/phone1/150/150',
          liked: false,
          format: 'FLAC',
          isLocal: true,
        },
        {
          id: 'local_' + Date.now() + '_2',
          title: 'Cyber City Audio',
          artist: 'Память устройства',
          cover: 'https://picsum.photos/seed/phone2/150/150',
          liked: false,
          format: 'MP3',
          isLocal: true,
        },
      ];

      setIsLoading(false);
      if (onImportSuccess) {
        onImportSuccess(importedTracks);
      }
      onClose();
    }, 1000);
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
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="folder-music-outline" size={38} color="#fc3f1d" />
          </View>

          <Text style={styles.modalTitle}>Импорт музыки</Text>
          <Text style={styles.modalSubtitle}>
            Выберите аудиофайлы из памяти вашего телефона или SD-карты
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.formatBadge}><Text style={styles.badgeText}>.MP3</Text></View>
            <View style={styles.formatBadge}><Text style={styles.badgeText}>.FLAC</Text></View>
            <View style={styles.formatBadge}><Text style={styles.badgeText}>.WAV</Text></View>
            <View style={styles.formatBadge}><Text style={styles.badgeText}>.M4A</Text></View>
          </View>

          <TouchableOpacity
            style={styles.pickButton}
            onPress={handlePickFiles}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.btnInner}>
                <Feather name="folder" size={18} color="#FFFFFF" />
                <Text style={styles.pickButtonText}>Открыть проводник</Text>
              </View>
            )}
          </TouchableOpacity>

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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
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
    marginBottom: 16,
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
    gap: 8,
    marginBottom: 24,
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
  pickButton: {
    backgroundColor: '#fc3f1d',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});