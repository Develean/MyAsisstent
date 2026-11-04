import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AnimatedCheckbox } from '../../../shared/components/AnimatedCheckbox';

interface SubtaskItem {
  id: number;
  taskId: number;
  title: string;
  isCompleted: boolean;
}

interface FocusSubtaskListProps {
  subtasks: SubtaskItem[];
  onToggleSubtask: (subtaskId: number, isCompleted: boolean) => void;
  newSubtaskTitle: string;
  onChangeNewSubtaskTitle: (text: string) => void;
  onAddNewSubtask: () => void;
}

export const FocusSubtaskList: React.FC<FocusSubtaskListProps> = ({
  subtasks,
  onToggleSubtask,
  newSubtaskTitle,
  onChangeNewSubtaskTitle,
  onAddNewSubtask,
}) => {
  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const totalCount = subtasks.length;

  return (
    <View style={styles.subtaskCard}>
      <View style={styles.subtaskHeaderRow}>
        <Text style={styles.subtaskTitle}>Subtask / Langkah Kerja</Text>
        <View style={styles.subtaskProgressBadge}>
          <Text style={styles.subtaskProgressText}>
            {completedCount} dari {totalCount} tuntas
          </Text>
        </View>
      </View>

      {/* Subtask Item List */}
      {subtasks.length > 0 ? (
        <View style={styles.subtaskList}>
          {subtasks.map((item) => (
            <View key={item.id} style={styles.subtaskItemRow}>
              <AnimatedCheckbox
                checked={item.isCompleted}
                onPress={() => onToggleSubtask(item.id, item.isCompleted)}
                size={20}
              />
              <Text
                style={[
                  styles.subtaskItemText,
                  item.isCompleted && styles.subtaskItemTextDone,
                ]}
                onPress={() => onToggleSubtask(item.id, item.isCompleted)}
              >
                {item.title}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptySubtaskHint}>
          Belum ada subtask untuk tugas ini. Tambah langkah kerja di bawah:
        </Text>
      )}

      {/* Tambah Subtask Input Form */}
      <View style={styles.addSubtaskRow}>
        <TextInput
          style={styles.subtaskInput}
          placeholder="Tambah langkah baru..."
          placeholderTextColor="#94A3B8"
          value={newSubtaskTitle}
          onChangeText={onChangeNewSubtaskTitle}
          onSubmitEditing={onAddNewSubtask}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.addSubtaskBtn}
          onPress={onAddNewSubtask}
          activeOpacity={0.8}
        >
          <Text style={styles.addSubtaskBtnText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subtaskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  subtaskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  subtaskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1B33',
  },
  subtaskProgressBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subtaskProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  subtaskList: {
    marginBottom: 14,
    gap: 10,
  },
  subtaskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
  },
  subtaskItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  subtaskItemTextDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  emptySubtaskHint: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtaskInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F1B33',
  },
  addSubtaskBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  addSubtaskBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
});
