import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { X, BookOpen, AlertCircle, FileText, ChevronRight } from 'lucide-react-native';
import { triggerHaptic } from '../../../shared/utils/haptics';

interface AddScheduleOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddSubject: () => void;
  onSelectAddExam: () => void;
  onSelectAddNote: () => void;
}

export const AddScheduleOptionsModal: React.FC<AddScheduleOptionsModalProps> = ({
  visible,
  onClose,
  onSelectAddSubject,
  onSelectAddExam,
  onSelectAddNote,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.modalTitle}>Tambah ke Jadwal</Text>
                  <Text style={styles.modalSubtitle}>Pilih item yang ingin Anda tambahkan:</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Option 1: Mata Pelajaran */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  triggerHaptic('selection');
                  onClose();
                  onSelectAddSubject();
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <BookOpen size={20} color="#2563EB" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Jadwal Mata Pelajaran</Text>
                  <Text style={styles.optionDesc}>
                    Atur jam mapel baru untuk jadwal kelas mingguanmu
                  </Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>

              {/* Option 2: Jadwal Ujian */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  triggerHaptic('selection');
                  onClose();
                  onSelectAddExam();
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
                  <AlertCircle size={20} color="#DC2626" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Jadwal Ujian (PTS / PAS)</Text>
                  <Text style={styles.optionDesc}>
                    Target evaluasi berkala dengan hitung mundur H-X dan alarm
                  </Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>

              {/* Option 3: Catatan Pelajaran */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  triggerHaptic('selection');
                  onClose();
                  onSelectAddNote();
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <FileText size={20} color="#16A34A" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Catatan Pelajaran</Text>
                  <Text style={styles.optionDesc}>
                    Tulis rumus penting, rangkuman, atau materi guru hari ini
                  </Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1B33',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1B33',
  },
  optionDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
    fontWeight: '500',
  },
});
