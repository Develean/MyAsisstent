import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';

interface CustomDurationModalProps {
  visible: boolean;
  onClose: () => void;
  customInputText: string;
  onChangeCustomInputText: (text: string) => void;
  onApplyCustomMinutes: () => void;
}

export const CustomDurationModal: React.FC<CustomDurationModalProps> = ({
  visible,
  onClose,
  customInputText,
  onChangeCustomInputText,
  onApplyCustomMinutes,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Atur Durasi Kustom</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#0F1B33" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            Tentukan berapa menit kamu ingin fokus (1 - 180 menit):
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Contoh: 35"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            value={customInputText}
            onChangeText={onChangeCustomInputText}
            autoFocus
          />
          <TouchableOpacity
            style={styles.modalSubmitBtn}
            onPress={onApplyCustomMinutes}
            activeOpacity={0.85}
          >
            <Text style={styles.modalSubmitText}>Pasang Durasi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 27, 51, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1B33',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1B33',
    marginBottom: 18,
    backgroundColor: '#F8FAFC',
  },
  modalSubmitBtn: {
    height: 46,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
