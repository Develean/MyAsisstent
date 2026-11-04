import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useAppDispatch } from '../../../store/store';
import { setUserProfile } from '../../user/userSlice';
import { setSubjects, setSchedules, setExams } from '../../schedule/scheduleSlice';
import { setTasks } from '../../tasks/taskSlice';
import { setNotes } from '../../notes/noteSlice';
import { LocalDataRepository } from '../../../db/repository';
import { X, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react-native';

interface RestoreDataModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RestoreDataModal: React.FC<RestoreDataModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const [jsonInput, setJsonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRestore = () => {
    if (!jsonInput.trim()) {
      Alert.alert('Perhatian', 'Tempelkan (paste) teks data JSON cadangan Anda terlebih dahulu.');
      return;
    }

    try {
      setIsProcessing(true);
      const data = JSON.parse(jsonInput.trim());

      if (!data || typeof data !== 'object') {
        throw new Error('Format data tidak valid.');
      }

      // Restore profile
      if (data.profile) {
        LocalDataRepository.saveUserProfile(data.profile);
        dispatch(setUserProfile(data.profile));
      }

      // Restore subjects
      if (Array.isArray(data.subjects)) {
        data.subjects.forEach((s: any) => LocalDataRepository.saveSubject(s));
        dispatch(setSubjects(data.subjects));
      }

      // Restore schedules
      if (Array.isArray(data.schedules)) {
        data.schedules.forEach((sch: any) => LocalDataRepository.saveSchedule(sch));
        dispatch(setSchedules(data.schedules));
      }

      // Restore tasks
      if (Array.isArray(data.tasks)) {
        data.tasks.forEach((t: any) => LocalDataRepository.saveTask(t));
        dispatch(setTasks(data.tasks));
      }

      // Restore exams
      if (Array.isArray(data.exams)) {
        data.exams.forEach((e: any) => LocalDataRepository.saveExam(e));
        dispatch(setExams(data.exams));
      }

      // Restore notes
      if (Array.isArray(data.notes)) {
        data.notes.forEach((n: any) => LocalDataRepository.saveNote(n));
        dispatch(setNotes(data.notes));
      }

      setJsonInput('');
      onClose();
      Alert.alert(
        'Pemulihan Berhasil! 🎉',
        'Seluruh jadwal, tugas, catatan, dan profil belajar Anda telah berhasil dipulihkan dari cadangan.'
      );
    } catch (err) {
      Alert.alert(
        'Format Tidak Valid',
        'Teks yang Anda masukkan bukan format JSON cadangan MyAsisstent yang valid. Pastikan Anda menyalin seluruh isi file cadangan.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.iconCircle}>
                    <RotateCcw size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.title}>Pulihkan Data (Restore)</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                {/* Warning Card */}
                <View style={styles.warningBox}>
                  <AlertTriangle size={16} color="#D97706" style={{ marginTop: 2, marginRight: 8 }} />
                  <Text style={styles.warningText}>
                    Tempelkan isi file JSON hasil cadangan sebelumnya. Data yang ada akan diperbarui sesuai isi cadangan.
                  </Text>
                </View>

                {/* JSON Input Area */}
                <Text style={styles.inputLabel}>Teks Data JSON Cadangan</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder='Tempelkan kode JSON di sini (contoh: {"app": "MyAsisstent", ...})'
                  placeholderTextColor="#94A3B8"
                  value={jsonInput}
                  onChangeText={setJsonInput}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </ScrollView>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.restoreBtn, isProcessing && { opacity: 0.7 }]}
                  onPress={handleRestore}
                  disabled={isProcessing}
                  activeOpacity={0.85}
                >
                  <CheckCircle size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.restoreBtnText}>
                    {isProcessing ? 'Memproses...' : 'Pulihkan Data'}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 27, 51, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1B33',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#0F1B33',
    minHeight: 130,
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  restoreBtn: {
    flex: 1.6,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  restoreBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
