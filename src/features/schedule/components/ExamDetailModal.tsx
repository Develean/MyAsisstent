import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../../store/store';
import { ExamWithSubject, deleteExam } from '../scheduleSlice';
import { LocalDataRepository } from '../../../db/repository';
import { formatIndonesianFullDate } from '../../../shared/utils/dateUtils';
import { triggerHaptic } from '../../../shared/utils/haptics';
import {
  X,
  AlertCircle,
  Calendar,
  Trash2,
  Play,
  CheckCircle2,
} from 'lucide-react-native';

interface ExamDetailModalProps {
  exam: ExamWithSubject | null;
  visible: boolean;
  onClose: () => void;
  onStartFocus?: () => void;
}

export const ExamDetailModal: React.FC<ExamDetailModalProps> = ({
  exam,
  visible,
  onClose,
  onStartFocus,
}) => {
  const dispatch = useAppDispatch();

  if (!exam) return null;

  const isPassed = exam.daysLeft < 0;
  const isToday = exam.daysLeft === 0;

  const handleDelete = () => {
    Alert.alert(
      'Hapus Jadwal Ujian',
      `Apakah Anda yakin ingin menghapus jadwal "${exam.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('medium');
            dispatch(deleteExam(exam.id));
            LocalDataRepository.deleteExam(exam.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerBadgeRow}>
                  <View style={styles.alertIconBox}>
                    <AlertCircle size={18} color="#DC2626" />
                  </View>
                  <Text style={styles.headerTag}>TARGET EVALUASI UJIAN</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Title & Subject */}
              <Text style={styles.examTitle}>{exam.title}</Text>
              {exam.subject && (
                <View style={styles.subjectBadge}>
                  <View
                    style={[
                      styles.subjectDot,
                      { backgroundColor: exam.subject.color || '#2563EB' },
                    ]}
                  />
                  <Text style={styles.subjectText}>{exam.subject.name}</Text>
                </View>
              )}

              {/* Countdown & Date Card */}
              <View style={styles.dateCard}>
                <View style={styles.dateRow}>
                  <Calendar size={18} color="#DC2626" style={{ marginRight: 8 }} />
                  <Text style={styles.dateText}>
                    {formatIndonesianFullDate(exam.examDate)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.countdownPill,
                    isPassed && styles.countdownPillPassed,
                    isToday && styles.countdownPillToday,
                  ]}
                >
                  <Text style={styles.countdownText}>
                    {isPassed
                      ? 'Telah Lewat'
                      : isToday
                      ? 'Hari Ini!'
                      : `H-${exam.daysLeft} (${exam.daysLeft} Hari Lagi)`}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                {onStartFocus && !isPassed && (
                  <TouchableOpacity
                    style={styles.focusBtn}
                    onPress={() => {
                      triggerHaptic('medium');
                      onClose();
                      onStartFocus();
                    }}
                    activeOpacity={0.85}
                  >
                    <Play size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.focusBtnText}>Review Materi</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.deleteBtn, (isPassed || !onStartFocus) && { flex: 1 }]}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <Trash2 size={16} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text style={styles.deleteBtnText}>Hapus Ujian</Text>
                </TouchableOpacity>
              </View>
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
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  examTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F1B33',
    lineHeight: 26,
    marginBottom: 8,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  dateCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
  },
  countdownPill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  countdownPillToday: {
    backgroundColor: '#059669',
  },
  countdownPillPassed: {
    backgroundColor: '#64748B',
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  focusBtn: {
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
  focusBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
