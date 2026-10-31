import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { addExam } from '../scheduleSlice';
import { LocalDataRepository } from '../../../db/repository';
import { LocalNotificationService } from '../../../shared/notifications/notificationService';
import { X, Calendar, Plus, AlertCircle } from 'lucide-react-native';

interface AddExamModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddExamModal: React.FC<AddExamModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const subjects = useAppSelector((state) => state.schedule.subjects);

  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    subjects.length > 0 ? subjects[0].id : null
  );
  const [daysCount, setDaysCount] = useState('3');

  const handleSave = () => {
    if (!title.trim()) return;
    const days = parseInt(daysCount, 10) || 3;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const dateStr = targetDate.toISOString().split('T')[0];

    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

    const newExam = {
      id: Date.now(),
      title: title.trim(),
      subjectId: selectedSubjectId,
      examDate: dateStr,
      daysLeft: days,
      subject: selectedSubject,
    };

    dispatch(addExam(newExam));
    LocalDataRepository.saveExam(newExam);

    // Schedule notification reminder
    LocalNotificationService.scheduleExamReminder(
      newExam.id,
      newExam.title,
      dateStr,
      days
    );

    setTitle('');
    onClose();
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
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <AlertCircle size={18} color="#DC2626" />
                  <Text style={styles.modalTitle}>Tambah Jadwal Ujian</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nama Ujian / Penilaian</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: PTS Matematika Wajib"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />

              {/* Subject Selector Chips */}
              <Text style={[styles.label, { marginTop: 14 }]}>Mata Pelajaran Terkait</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subjectChips}
              >
                {subjects.map((sub) => {
                  const isSelected = selectedSubjectId === sub.id;
                  return (
                    <TouchableOpacity
                      key={sub.id}
                      style={[
                        styles.chip,
                        isSelected && { backgroundColor: sub.color || '#2563EB', borderColor: sub.color || '#2563EB' },
                      ]}
                      onPress={() => setSelectedSubjectId(sub.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && { color: '#FFFFFF' },
                        ]}
                      >
                        {sub.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Countdown Target (Days Left) */}
              <Text style={[styles.label, { marginTop: 14 }]}>Berapa Hari Lagi Ujian Dimulai?</Text>
              <View style={styles.daysRow}>
                {['1', '3', '5', '7', '14'].map((d) => {
                  const isSelected = daysCount === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.daySelectBtn, isSelected && styles.daySelectBtnActive]}
                      onPress={() => setDaysCount(d)}
                    >
                      <Text style={[styles.daySelectText, isSelected && styles.daySelectTextActive]}>
                        H-{d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.saveBtnText}>Simpan Jadwal Ujian</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
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
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1B33',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F1B33',
  },
  subjectChips: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  daySelectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  daySelectBtnActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  daySelectText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  daySelectTextActive: {
    color: '#DC2626',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

