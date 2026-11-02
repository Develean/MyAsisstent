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
import { useAppDispatch } from '../../../store/store';
import {
  TaskWithSubtasks,
  toggleSubtaskCompletion,
  toggleTaskCompletion,
  addSubtask,
  deleteSubtask,
  autoBreakdownTask,
  deleteTask,
} from '../taskSlice';
import { setActiveTask } from '../../focus/focusSlice';
import { addExp } from '../../user/userSlice';
import { LocalDataRepository } from '../../../db/repository';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Clock,
  Play,
} from 'lucide-react-native';
import { AnimatedCheckbox } from '../../../shared/components/AnimatedCheckbox';
import { ActionFeedbackToast, ToastType } from '../../../shared/components/ActionFeedbackToast';

interface TaskDetailModalProps {
  task: TaskWithSubtasks | null;
  visible: boolean;
  onClose: () => void;
  onStartFocus?: (taskId: number) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  visible,
  onClose,
  onStartFocus,
}) => {
  const dispatch = useAppDispatch();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Toast Action Feedback State
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    subMessage?: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    subMessage: '',
    type: 'success',
  });

  const showToast = (message: string, subMessage?: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, subMessage, type });
  };

  if (!task) return null;

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : task.isCompleted ? 100 : 0;

  const handleToggleMainTask = () => {
    const willComplete = !task.isCompleted;
    dispatch(toggleTaskCompletion(task.id));
    if (willComplete) {
      dispatch(addExp(20));
      showToast('Tugas Tuntas! 🎉', '+20 EXP berhasil didapatkan', 'exp');
    } else {
      showToast('Status Tugas Diperbarui', 'Tugas dikembalikan ke antrean aktif', 'info');
    }
  };

  const handleToggleSubtask = (subId: number, currentCompleted: boolean) => {
    dispatch(toggleSubtaskCompletion({ taskId: task.id, subtaskId: subId }));
    if (!currentCompleted) {
      dispatch(addExp(5));
      showToast('Langkah Mini Selesai! ⭐', '+5 EXP ditambahkan', 'exp');
    } else {
      showToast('Subtask Diperbarui', 'Subtask dikembalikan', 'info');
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const title = newSubtaskTitle.trim();
    dispatch(addSubtask({ taskId: task.id, title }));
    showToast('Langkah Ditambahkan 📝', title, 'info');
    setNewSubtaskTitle('');
  };

  const handleAutoBreakdown = () => {
    dispatch(autoBreakdownTask({ taskId: task.id }));
    showToast('Langkah Mini Dibuat! ⚡', 'Tugas dipecah otomatis jadi 3 langkah', 'success');
  };

  const handleStartFocus = () => {
    dispatch(setActiveTask({ taskId: task.id }));
    onClose();
    if (onStartFocus) onStartFocus(task.id);
  };

  const handleDelete = () => {
    dispatch(deleteTask(task.id));
    LocalDataRepository.deleteTask(task.id);
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
                <View style={styles.headerLeft}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: task.priority === 'urgent' ? '#FEE2E2' : '#F1F5F9' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: task.priority === 'urgent' ? '#DC2626' : '#64748B' },
                      ]}
                    >
                      {task.priority === 'urgent' ? 'Penting' : 'Normal'}
                    </Text>
                  </View>
                  {task.deadlineDate ? (
                    <View style={styles.deadlineContainer}>
                      <Clock size={12} color="#EF4444" />
                      <Text style={styles.deadlineText}>{task.deadlineDate}</Text>
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Task Title & Animated Status Toggle */}
              <View style={styles.titleRow}>
                <AnimatedCheckbox
                  checked={task.isCompleted}
                  onPress={handleToggleMainTask}
                  size={24}
                />
                <Text style={[styles.taskTitle, task.isCompleted && styles.taskTitleCompleted]}>
                  {task.title}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>
                    Progres Subtask: {completedSubtasks}/{totalSubtasks} Selesai
                  </Text>
                  <Text style={styles.progressPercentage}>{progressPercent}%</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>

              {/* Auto Breakdown Action Button */}
              {totalSubtasks === 0 && (
                <TouchableOpacity style={styles.autoBreakdownBtn} onPress={handleAutoBreakdown}>
                  <Sparkles size={16} color="#2563EB" />
                  <Text style={styles.autoBreakdownText}>
                    ⚡ Pecah Jadi Langkah-Langkah Mini (Otomatis)
                  </Text>
                </TouchableOpacity>
              )}

              {/* Subtasks List */}
              <Text style={styles.sectionSubtitle}>Langkah-Langkah Pengerjaan (Subtasks):</Text>
              <ScrollView style={styles.subtaskScroll} showsVerticalScrollIndicator={false}>
                {totalSubtasks === 0 ? (
                  <View style={styles.actionableEmptySubtasksCard}>
                    <View style={styles.emptySubtaskIconCircle}>
                      <Sparkles size={18} color="#2563EB" />
                    </View>
                    <Text style={styles.emptySubtaskTitle}>Tugas Masih Utuh & Berat?</Text>
                    <Text style={styles.emptySubtaskSubtitle}>
                      Pecah tugas ini jadi potongan langkah mini 10-15 menitan agar pikiran tidak jenuh dan cepat selesai.
                    </Text>
                    <TouchableOpacity
                      style={styles.emptySubtaskCtaBtn}
                      onPress={handleAutoBreakdown}
                      activeOpacity={0.85}
                    >
                      <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.emptySubtaskCtaText}>Pecah Otomatis Sekarang</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  task.subtasks.map((sub) => (
                    <View key={sub.id} style={styles.subtaskItem}>
                      <AnimatedCheckbox
                        checked={sub.isCompleted}
                        onPress={() => handleToggleSubtask(sub.id, sub.isCompleted)}
                        size={19}
                      />
                      <Text
                        style={[
                          styles.subtaskTitle,
                          sub.isCompleted && styles.subtaskTitleCompleted,
                        ]}
                        onPress={() => handleToggleSubtask(sub.id, sub.isCompleted)}
                      >
                        {sub.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          dispatch(deleteSubtask({ taskId: task.id, subtaskId: sub.id }))
                        }
                        style={styles.deleteSubtaskBtn}
                      >
                        <Trash2 size={15} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>

              {/* Add Custom Subtask Input */}
              <View style={styles.addSubtaskRow}>
                <TextInput
                  style={styles.subtaskInput}
                  placeholder="Tambah langkah mini (+)..."
                  placeholderTextColor="#94A3B8"
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  onSubmitEditing={handleAddSubtask}
                />
                <TouchableOpacity style={styles.addSubtaskBtn} onPress={handleAddSubtask}>
                  <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Action Buttons: Focus Timer & Delete */}
              <View style={styles.footerRow}>
                <TouchableOpacity style={styles.focusActionBtn} onPress={handleStartFocus}>
                  <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.focusActionText}>Mulai Sesi Fokus</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Floating Action Feedback Toast */}
              <ActionFeedbackToast
                visible={toast.visible}
                message={toast.message}
                subMessage={toast.subMessage}
                type={toast.type}
                onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
                topOffset={20}
              />
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
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  checkButton: {
    marginTop: 2,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1B33',
    lineHeight: 24,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  progressContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  autoBreakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 14,
  },
  autoBreakdownText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1B33',
    marginBottom: 8,
  },
  subtaskScroll: {
    maxHeight: 180,
    marginBottom: 12,
  },
  emptySubtasks: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  emptySubtasksText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    textAlign: 'center',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  subtaskCheckBtn: {
    marginRight: 10,
  },
  uncheckedBox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.8,
    borderColor: '#94A3B8',
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  deleteSubtaskBtn: {
    padding: 4,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F1B33',
  },
  addSubtaskBtn: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  focusActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  focusActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deleteBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionableEmptySubtasksCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySubtaskIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptySubtaskTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1B33',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtaskSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  emptySubtaskCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  emptySubtaskCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

