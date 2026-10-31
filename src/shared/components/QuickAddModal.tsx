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
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { addTask } from '../../features/tasks/taskSlice';
import { addSchedule, addSubject } from '../../features/schedule/scheduleSlice';
import { autoGenerateSubtasks } from '../../features/tasks/subtaskEngine';
import { LocalDataRepository } from '../../db/repository';
import { LocalNotificationService } from '../notifications/notificationService';
import { CheckSquare, Calendar, X, Plus, Sparkles } from 'lucide-react-native';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const selectedDay = useAppSelector((state) => state.schedule.selectedDay);

  const [mode, setMode] = useState<'task' | 'subject'>('task');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'normal' | 'urgent'>('normal');
  const [autoBreakdown, setAutoBreakdown] = useState(true);

  const [subjectName, setSubjectName] = useState('');
  const [subjectRoom, setSubjectRoom] = useState('');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:00');

  const handleSave = () => {
    if (mode === 'task') {
      if (!taskTitle.trim()) return;
      const taskId = Date.now();
      const generated = autoBreakdown ? autoGenerateSubtasks(taskTitle.trim()) : [];
      const subtasks = generated.map((g, idx) => ({
        id: taskId + 1 + idx,
        taskId: taskId,
        title: g.title,
        isCompleted: false,
        orderIdx: g.orderIdx,
      }));

      const newTask = {
        id: taskId,
        title: taskTitle.trim(),
        priority: taskPriority,
        isCompleted: false,
        deadlineDate: 'Besok, 23:59',
        createdAt: new Date().toISOString(),
        subtasks: subtasks,
        subjectId: null,
      };

      dispatch(addTask(newTask));
      LocalDataRepository.saveTask(newTask);

      // Schedule deadline notification for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 0, 0);
      LocalNotificationService.scheduleTaskDeadlineReminder(
        taskId,
        newTask.title,
        tomorrow.toISOString()
      );

      setTaskTitle('');
    } else {
      if (!subjectName.trim()) return;
      const subId = Date.now();
      const newSubject = {
        id: subId,
        name: subjectName.trim(),
        room: subjectRoom.trim(),
        color: '#2563EB',
        bgColor: '#DBEAFE',
        initial: subjectName.trim().charAt(0).toUpperCase(),
      };
      dispatch(addSubject(newSubject));
      LocalDataRepository.saveSubject(newSubject);

      const newSchedule = {
        id: Date.now() + 1,
        subjectId: subId,
        dayOfWeek: selectedDay,
        startTime: startTime || '07:30',
        endTime: endTime || '09:00',
        subject: newSubject,
      };
      dispatch(addSchedule(newSchedule));
      LocalDataRepository.saveSchedule(newSchedule);

      setSubjectName('');
      setSubjectRoom('');
    }
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
                <Text style={styles.modalTitle}>Tambah Cepat</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Toggle Mode */}
              <View style={styles.modeTabs}>
                <TouchableOpacity
                  style={[styles.modeTab, mode === 'task' && styles.modeTabActive]}
                  onPress={() => setMode('task')}
                >
                  <CheckSquare size={14} color={mode === 'task' ? '#FFFFFF' : '#64748B'} />
                  <Text style={[styles.modeTabText, mode === 'task' && styles.modeTabTextActive]}>
                    Tugas Sekolah
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeTab, mode === 'subject' && styles.modeTabActive]}
                  onPress={() => setMode('subject')}
                >
                  <Calendar size={14} color={mode === 'subject' ? '#FFFFFF' : '#64748B'} />
                  <Text style={[styles.modeTabText, mode === 'subject' && styles.modeTabTextActive]}>
                    Mata Pelajaran
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Body */}
              {mode === 'task' ? (
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Judul Tugas / PR</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Latihan Soal Bab 3 Hal 45"
                    placeholderTextColor="#94A3B8"
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                    autoFocus
                  />

                  <Text style={[styles.label, { marginTop: 12 }]}>Tingkat Prioritas</Text>
                  <View style={styles.priorityRow}>
                    {(['low', 'normal', 'urgent'] as const).map((p) => {
                      const isActive = taskPriority === p;
                      const label = p === 'urgent' ? 'Penting / Ujian' : p === 'normal' ? 'Normal' : 'Santai';
                      return (
                        <TouchableOpacity
                          key={p}
                          style={[styles.priorityBtn, isActive && styles.priorityBtnActive]}
                          onPress={() => setTaskPriority(p)}
                        >
                          <Text style={[styles.priorityBtnText, isActive && styles.priorityBtnTextActive]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Auto Breakdown Checkbox */}
                  <TouchableOpacity
                    style={styles.breakdownToggle}
                    activeOpacity={0.8}
                    onPress={() => setAutoBreakdown(!autoBreakdown)}
                  >
                    <View style={[styles.checkbox, autoBreakdown && styles.checkboxActive]}>
                      {autoBreakdown && <CheckSquare size={16} color="#FFFFFF" />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Sparkles size={13} color="#2563EB" />
                        <Text style={styles.breakdownTitle}>Pecah Jadi Subtask Otomatis</Text>
                      </View>
                      <Text style={styles.breakdownDesc}>
                        Otomatis bagi jadi 3–4 langkah pengerjaan mini 15–20 menit
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Nama Mata Pelajaran</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Biologi, Matematika Wajib"
                    placeholderTextColor="#94A3B8"
                    value={subjectName}
                    onChangeText={setSubjectName}
                    autoFocus
                  />

                  <View style={styles.rowInputs}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { marginTop: 12 }]}>Jam Mulai</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="07:30"
                        placeholderTextColor="#94A3B8"
                        value={startTime}
                        onChangeText={setStartTime}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.label, { marginTop: 12 }]}>Jam Selesai</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="09:00"
                        placeholderTextColor="#94A3B8"
                        value={endTime}
                        onChangeText={setEndTime}
                      />
                    </View>
                  </View>

                  <Text style={[styles.label, { marginTop: 12 }]}>Ruang Kelas / Guru (Opsional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Lab Kimia / Bu Rina"
                    placeholderTextColor="#94A3B8"
                    value={subjectRoom}
                    onChangeText={setSubjectRoom}
                  />
                </View>
              )}

              {/* Save Button */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.saveBtnText}>Simpan {mode === 'task' ? 'Tugas' : 'Mapel'}</Text>
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
    marginBottom: 14,
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
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: '#2563EB',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  formContainer: {
    marginBottom: 16,
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
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  priorityBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  priorityBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  priorityBtnTextActive: {
    color: '#2563EB',
  },
  breakdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  breakdownDesc: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
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
