import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { TaskWithSubtasks } from '../taskSlice';
import { Subject } from '../../../db/schema';
import { formatDeadlineDisplay } from '../../../shared/utils/dateUtils';
import { triggerHaptic } from '../../../shared/utils/haptics';
import {
  X,
  CheckCircle2,
  Clock,
  ListTodo,
  CheckSquare,
  AlertCircle,
  Plus,
} from 'lucide-react-native';

interface AllTasksModalProps {
  visible: boolean;
  onClose: () => void;
  tasks: TaskWithSubtasks[];
  subjects: Subject[];
  onSelectTask: (task: TaskWithSubtasks) => void;
  onOpenQuickAdd: () => void;
}

export const AllTasksModal: React.FC<AllTasksModalProps> = ({
  visible,
  onClose,
  tasks,
  subjects,
  onSelectTask,
  onOpenQuickAdd,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  const getSubjectInfo = (subjectId?: number | null) => {
    if (!subjectId) return null;
    return subjects.find((s) => s.id === subjectId) || null;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconCircle}>
                    <ListTodo size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.title}>Daftar Semua Tugas</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Filter Tabs */}
              <View style={styles.filterTabs}>
                {[
                  { key: 'pending', label: 'Tertunda' },
                  { key: 'completed', label: 'Selesai' },
                  { key: 'all', label: 'Semua' },
                ].map((item) => {
                  const isActive = filter === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.filterTab, isActive && styles.filterTabActive]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setFilter(item.key as any);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterTabText,
                          isActive && styles.filterTabTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tasks List */}
              <ScrollView style={styles.taskListScroll} showsVerticalScrollIndicator={false}>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((t) => {
                    const sub = getSubjectInfo(t.subjectId);
                    const initial = sub?.initial || t.title.charAt(0).toUpperCase() || 'T';
                    const bgColor = sub?.bgColor || '#DBEAFE';
                    const textColor = sub?.color || '#1D4ED8';

                    return (
                      <TouchableOpacity
                        key={t.id}
                        style={[styles.taskCard, t.isCompleted && styles.taskCardCompleted]}
                        onPress={() => {
                          onClose();
                          onSelectTask(t);
                        }}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.subjectBox, { backgroundColor: bgColor }]}>
                          <Text style={[styles.subjectInitial, { color: textColor }]}>
                            {initial}
                          </Text>
                        </View>

                        <View style={styles.taskMiddle}>
                          <View style={styles.taskTitleRow}>
                            <Text
                              style={[
                                styles.taskTitle,
                                t.isCompleted && styles.taskTitleCompleted,
                              ]}
                              numberOfLines={1}
                            >
                              {t.title}
                            </Text>
                            {t.priority === 'urgent' && !t.isCompleted && (
                              <View style={styles.urgentBadge}>
                                <Text style={styles.urgentBadgeText}>Penting</Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.taskMetaRow}>
                            <Clock size={11} color="#64748B" />
                            <Text style={styles.deadlineText}>
                              Tenggat: {formatDeadlineDisplay(t.deadlineDate)}
                            </Text>
                            {t.subtasks.length > 0 && (
                              <Text style={styles.subtaskBadge}>
                                • {t.subtasks.filter((s) => s.isCompleted).length}/{t.subtasks.length} subtask
                              </Text>
                            )}
                          </View>
                        </View>

                        {t.isCompleted ? (
                          <CheckCircle2 size={20} color="#10B981" />
                        ) : (
                          <View style={styles.uncompletedCircle} />
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyContainer}>
                    <CheckSquare size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyTitle}>
                      {filter === 'pending'
                        ? 'Semua tugas telah tuntas!'
                        : filter === 'completed'
                        ? 'Belum ada tugas yang diselesaikan'
                        : 'Belum ada tugas tersimpan'}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                      {filter === 'pending'
                        ? 'Bagus sekali! Kamu bisa membuat tugas baru untuk target belajarmu selanjutnya.'
                        : 'Tugas yang kamu selesaikan akan tercatat di sini sebagai riwayat.'}
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Add New Task Floating CTA */}
              <TouchableOpacity
                style={styles.addTaskBtn}
                onPress={() => {
                  onClose();
                  onOpenQuickAdd();
                }}
                activeOpacity={0.85}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.addTaskBtnText}>Tambah Tugas Baru</Text>
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
    padding: 20,
    maxHeight: '88%',
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
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
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#2563EB',
  },
  taskListScroll: {
    maxHeight: 380,
    marginBottom: 14,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 10,
  },
  taskCardCompleted: {
    opacity: 0.65,
    backgroundColor: '#F1F5F9',
  },
  subjectBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectInitial: {
    fontSize: 15,
    fontWeight: '800',
  },
  taskMiddle: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1B33',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  urgentBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  deadlineText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  subtaskBadge: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  uncompletedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.8,
    borderColor: '#CBD5E1',
  },
  emptyContainer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1B33',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  addTaskBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addTaskBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
