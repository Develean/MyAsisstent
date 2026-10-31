import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { ScheduleWithSubject, deleteSchedule } from '../scheduleSlice';
import { addTask, toggleTaskCompletion } from '../../tasks/taskSlice';
import { autoGenerateSubtasks } from '../../tasks/subtaskEngine';
import {
  X,
  Clock,
  MapPin,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  CheckSquare,
} from 'lucide-react-native';

interface SubjectDetailModalProps {
  schedule: ScheduleWithSubject | null;
  visible: boolean;
  onClose: () => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  schedule,
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  if (!schedule) return null;

  // Filter tasks belonging to this subject
  const subjectTasks = tasks.filter(
    (t) => t.subjectId === schedule.subjectId || t.title.toLowerCase().includes(schedule.subject.name.toLowerCase())
  );

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    const taskId = Date.now();
    const generated = autoGenerateSubtasks(newTaskTitle.trim(), schedule.subject.name);
    const subtasks = generated.map((g, idx) => ({
      id: taskId + 1 + idx,
      taskId: taskId,
      title: g.title,
      isCompleted: false,
      orderIdx: g.orderIdx,
    }));

    dispatch(
      addTask({
        id: taskId,
        title: newTaskTitle.trim(),
        subjectId: schedule.subjectId,
        priority: 'normal',
        isCompleted: false,
        deadlineDate: 'Minggu Ini',
        createdAt: new Date().toISOString(),
        subtasks,
      })
    );
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handleDeleteSchedule = () => {
    dispatch(deleteSchedule(schedule.id));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Color Header Banner */}
              <View
                style={[
                  styles.headerBanner,
                  { backgroundColor: schedule.subject.color || '#2563EB' },
                ]}
              >
                <View style={styles.headerTop}>
                  <View style={styles.initialBadge}>
                    <Text style={styles.initialText}>
                      {schedule.subject.initial || schedule.subject.name.charAt(0)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.subjectTitle}>{schedule.subject.name}</Text>
                <View style={styles.scheduleMetaRow}>
                  <View style={styles.metaBadge}>
                    <Clock size={12} color="#FFFFFF" />
                    <Text style={styles.metaBadgeText}>
                      {schedule.dayOfWeek} · {schedule.startTime} - {schedule.endTime}
                    </Text>
                  </View>
                  {schedule.subject.room ? (
                    <View style={styles.metaBadge}>
                      <MapPin size={12} color="#FFFFFF" />
                      <Text style={styles.metaBadgeText}>{schedule.subject.room}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Tasks Linked to this Subject */}
              <View style={styles.body}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>
                    Tugas & PR Mapel Ini ({subjectTasks.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.addTaskInlineBtn}
                    onPress={() => setIsAddingTask(!isAddingTask)}
                  >
                    <Plus size={14} color="#2563EB" />
                    <Text style={styles.addTaskInlineText}>Tugas</Text>
                  </TouchableOpacity>
                </View>

                {isAddingTask && (
                  <View style={styles.addTaskBox}>
                    <TextInput
                      style={styles.taskInput}
                      placeholder={`Tugas ${schedule.subject.name}...`}
                      placeholderTextColor="#94A3B8"
                      value={newTaskTitle}
                      onChangeText={setNewTaskTitle}
                      autoFocus
                    />
                    <TouchableOpacity style={styles.saveTaskBtn} onPress={handleCreateTask}>
                      <Text style={styles.saveTaskBtnText}>Simpan</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <ScrollView style={styles.tasksScroll} showsVerticalScrollIndicator={false}>
                  {subjectTasks.length === 0 ? (
                    <View style={styles.emptyTasksBox}>
                      <BookOpen size={24} color="#94A3B8" />
                      <Text style={styles.emptyTasksText}>
                        Belum ada tugas untuk mata pelajaran ini.
                      </Text>
                    </View>
                  ) : (
                    subjectTasks.map((task) => (
                      <View key={task.id} style={styles.taskItem}>
                        <TouchableOpacity
                          onPress={() => dispatch(toggleTaskCompletion(task.id))}
                          style={styles.taskCheck}
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 size={18} color="#10B981" />
                          ) : (
                            <Circle size={18} color="#CBD5E1" />
                          )}
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.taskItemTitle,
                              task.isCompleted && styles.taskItemTitleCompleted,
                            ]}
                          >
                            {task.title}
                          </Text>
                          {task.subtasks.length > 0 && (
                            <Text style={styles.subtaskCountText}>
                              {task.subtasks.filter((s) => s.isCompleted).length}/
                              {task.subtasks.length} subtask selesai
                            </Text>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>

                {/* Footer Actions */}
                <TouchableOpacity
                  style={styles.deleteScheduleBtn}
                  onPress={handleDeleteSchedule}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text style={styles.deleteScheduleText}>Hapus Jadwal Ini</Text>
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
    overflow: 'hidden',
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  headerBanner: {
    padding: 20,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  initialBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  scheduleMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    padding: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1B33',
  },
  addTaskInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  addTaskInlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  addTaskBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  taskInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F1B33',
  },
  saveTaskBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveTaskBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tasksScroll: {
    maxHeight: 180,
    marginBottom: 16,
  },
  emptyTasksBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  emptyTasksText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  taskCheck: {
    marginRight: 10,
  },
  taskItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1B33',
  },
  taskItemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  subtaskCountText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  deleteScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 11,
    borderRadius: 14,
    gap: 6,
  },
  deleteScheduleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
});

