import React, { useState, useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { addExam } from '../scheduleSlice';
import { LocalDataRepository } from '../../../db/repository';
import { LocalNotificationService } from '../../../shared/notifications/notificationService';
import { generateId } from '../../../shared/utils/idGenerator';
import {
  getDateOnlyString,
  formatIndonesianFullDate,
  calculateDaysLeft,
} from '../../../shared/utils/dateUtils';
import { triggerHaptic } from '../../../shared/utils/haptics';
import { X, Calendar, Plus, AlertCircle, Bell } from 'lucide-react-native';

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
  const [examDate, setExamDate] = useState(getDateOnlyString(3)); // default H-3
  const [activePreset, setActivePreset] = useState<number | null>(3);

  // Sync default subject when modal opens or subjects change
  useEffect(() => {
    if (subjects.length > 0 && selectedSubjectId === null) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const daysLeft = calculateDaysLeft(examDate);

  const handleSelectPreset = (days: number) => {
    triggerHaptic('selection');
    setActivePreset(days);
    setExamDate(getDateOnlyString(days));
  };

  const handleDateChange = (val: string) => {
    setExamDate(val);
    setActivePreset(null);
  };

  const handleSave = () => {
    if (!title.trim() || !examDate.trim()) return;
    triggerHaptic('success');

    const calculatedDays = Math.max(0, calculateDaysLeft(examDate));
    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

    const newExam = {
      id: generateId(),
      title: title.trim(),
      subjectId: selectedSubjectId,
      examDate: examDate.trim(),
      daysLeft: calculatedDays,
      subject: selectedSubject,
    };

    dispatch(addExam(newExam));
    LocalDataRepository.saveExam(newExam);

    // Schedule notification reminder
    LocalNotificationService.scheduleExamReminder(
      newExam.id,
      newExam.title,
      examDate.trim(),
      calculatedDays
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
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.examIconBadge}>
                    <AlertCircle size={18} color="#DC2626" />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Tambah Jadwal Ujian</Text>
                    <Text style={styles.modalSubtitle}>PTS / PAS / Asesmen Sumatif</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Form Input Nama Ujian */}
                <Text style={styles.label}>Nama Ujian / Penilaian</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: PTS Matematika Wajib Semester 1"
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />

                {/* Subject Selector Chips */}
                {subjects.length > 0 && (
                  <>
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
                              isSelected && {
                                backgroundColor: sub.color || '#2563EB',
                                borderColor: sub.color || '#2563EB',
                              },
                            ]}
                            onPress={() => {
                              triggerHaptic('selection');
                              setSelectedSubjectId(sub.id);
                            }}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isSelected && { color: '#FFFFFF', fontWeight: '800' },
                              ]}
                            >
                              {sub.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </>
                )}

                {/* Tanggal Pelaksanaan Ujian / Deadline Form */}
                <Text style={[styles.label, { marginTop: 14 }]}>
                  Tanggal Pelaksanaan Ujian (Batas Waktu)
                </Text>

                {/* Preset Chips */}
                <View style={styles.daysRow}>
                  {[
                    { label: 'Besok (H-1)', days: 1 },
                    { label: '3 Hari (H-3)', days: 3 },
                    { label: '1 Minggu (H-7)', days: 7 },
                    { label: '2 Minggu (H-14)', days: 14 },
                  ].map((p) => {
                    const isSelected = activePreset === p.days;
                    return (
                      <TouchableOpacity
                        key={p.days}
                        style={[styles.daySelectBtn, isSelected && styles.daySelectBtnActive]}
                        onPress={() => handleSelectPreset(p.days)}
                      >
                        <Text style={[styles.daySelectText, isSelected && styles.daySelectTextActive]}>
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Date Input Box */}
                <View style={styles.dateInputWrapper}>
                  <Calendar size={16} color="#DC2626" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.dateTextInput}
                    placeholder="YYYY-MM-DD (Contoh: 2026-11-15)"
                    placeholderTextColor="#94A3B8"
                    value={examDate}
                    onChangeText={handleDateChange}
                  />
                </View>

                {/* Real-time Date Preview Card */}
                <View style={styles.datePreviewCard}>
                  <Text style={styles.datePreviewTitle}>
                    {formatIndonesianFullDate(examDate)}
                  </Text>
                  <View style={styles.countdownPill}>
                    <Text style={styles.countdownPillText}>
                      {daysLeft <= 0 ? 'Hari Ini!' : `H-${daysLeft} (${daysLeft} hari lagi)`}
                    </Text>
                  </View>
                </View>

                {/* Notification Auto-Schedule Notice */}
                <View style={styles.reminderNoticeBox}>
                  <Bell size={14} color="#B45309" style={{ marginTop: 2, marginRight: 8 }} />
                  <Text style={styles.reminderNoticeText}>
                    Pengingat otomatis H-1 pagi (07:00) dan malam hari akan dijadwalkan agar Anda sempat mereview materi.
                  </Text>
                </View>
              </ScrollView>

              {/* Submit CTA */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
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
    maxHeight: '90%',
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
  examIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F1B33',
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5670',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F1B33',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5670',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  daySelectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  daySelectBtnActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  daySelectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  daySelectTextActive: {
    color: '#DC2626',
    fontWeight: '800',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  dateTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F1B33',
    fontWeight: '600',
  },
  datePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  datePreviewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
    flex: 1,
  },
  countdownPill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  countdownPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  reminderNoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  reminderNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
    fontWeight: '500',
  },
  saveBtn: {
    marginTop: 8,
    backgroundColor: '#DC2626',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
