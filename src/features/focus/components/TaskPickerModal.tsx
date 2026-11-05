import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Sparkles } from 'lucide-react-native';
import { TaskWithSubtasks } from '../../tasks/taskSlice';
import { Subject } from '../../../db/schema';

interface TaskPickerModalProps {
  visible: boolean;
  onClose: () => void;
  activeTaskId: number | null;
  tasks: TaskWithSubtasks[];
  subjects: Subject[];
  onSelectTask: (taskId: number) => void;
  onClearTask: () => void;
}

export const TaskPickerModal: React.FC<TaskPickerModalProps> = ({
  visible,
  onClose,
  activeTaskId,
  tasks,
  subjects,
  onSelectTask,
  onClearTask,
}) => {
  const activeUncompletedTasks = tasks.filter((t) => !t.isCompleted);

  const getTaskSubjectName = (task: TaskWithSubtasks) => {
    if (task.subjectId) {
      const s = subjects.find((sub) => sub.id === task.subjectId);
      if (s) return s.name;
    }
    const lower = task.title.toLowerCase();
    if (lower.includes('fisika')) return 'Fisika';
    if (lower.includes('matematika') || lower.includes('mtk')) return 'Matematika';
    if (lower.includes('biologi')) return 'Biologi';
    if (lower.includes('sejarah')) return 'Sejarah';
    if (lower.includes('kimia')) return 'Kimia';
    return 'Umum';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pilih Tugas untuk Difokuskan</Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} color="#0F1B33" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {/* Option to clear active task / focus without linked task */}
            <TouchableOpacity
              style={[
                styles.taskOptionRow,
                activeTaskId === null && styles.taskOptionRowSelected,
              ]}
              onPress={() => {
                onClearTask();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.freeModeBadge}>
                <Sparkles size={14} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskOptionTitle}>
                  Mode Bebas / Mandiri (Tanpa Tugas)
                </Text>
                <Text style={styles.taskOptionSubtitle}>
                  Timer fokus umum tanpa ikatan checklist subtask
                </Text>
              </View>
            </TouchableOpacity>

            {activeUncompletedTasks.map((t) => {
              const isSelected = activeTaskId === t.id;
              const subName = getTaskSubjectName(t);
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.taskOptionRow,
                    isSelected && styles.taskOptionRowSelected,
                  ]}
                  onPress={() => {
                    onSelectTask(t.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskOptionBadge}>
                    <Text style={styles.taskOptionBadgeText}>
                      {subName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskOptionTitle} numberOfLines={1}>
                      {t.title}
                    </Text>
                    <Text style={styles.taskOptionSubtitle}>
                      {subName} • {t.subtasks.length} Subtask
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 27, 51, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1B33',
  },
  taskOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskOptionRowSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  freeModeBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskOptionBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF4FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskOptionBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  taskOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1B33',
  },
  taskOptionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
