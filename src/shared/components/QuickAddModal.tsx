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
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { addTask } from '../../features/tasks/taskSlice';
import { addSchedule, addSubject, addExam } from '../../features/schedule/scheduleSlice';
import { autoGenerateSubtasks } from '../../features/tasks/subtaskEngine';
import { LocalDataRepository } from '../../db/repository';
import { LocalNotificationService } from '../notifications/notificationService';
import { generateId } from '../utils/idGenerator';
import {
  getDateOnlyString,
  getCustomDeadlineISO,
  buildLocalDeadlineISO,
  isValidDateString,
  formatIndonesianFullDate,
  calculateDaysLeft,
} from '../utils/dateUtils';
import { triggerHaptic } from '../utils/haptics';
import {
  CheckSquare,
  Calendar,
  AlertCircle,
  X,
  Plus,
  Sparkles,
  Clock,
  BookOpen,
} from 'lucide-react-native';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const selectedDay = useAppSelector((state) => state.schedule.selectedDay);
  const subjects = useAppSelector((state) => state.schedule.subjects);

  const [mode, setMode] = useState<'task' | 'exam' | 'subject'>('task');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState<number | null>(null);
  const [taskPriority, setTaskPriority] = useState<'low' | 'normal' | 'urgent'>('normal');
  const [autoBreakdown, setAutoBreakdown] = useState(true);
  const [taskDeadlineDate, setTaskDeadlineDate] = useState(getDateOnlyString(1)); // default: besok
  const [taskDeadlineTime, setTaskDeadlineTime] = useState('23:59');
  const [taskActivePreset, setTaskActivePreset] = useState<number | null>(1);

  // Exam Form State
  const [examTitle, setExamTitle] = useState('');
  const [examSubjectId, setExamSubjectId] = useState<number | null>(null);
  const [examDate, setExamDate] = useState(getDateOnlyString(3)); // default: H-3
  const [examActivePreset, setExamActivePreset] = useState<number | null>(3);

  // Subject Form State
  const [subjectName, setSubjectName] = useState('');
  const [subjectRoom, setSubjectRoom] = useState('');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:00');

  // Handlers for Task Presets
  const handleSelectTaskPreset = (daysOffset: number) => {
    triggerHaptic('selection');
    setTaskActivePreset(daysOffset);
    setTaskDeadlineDate(getDateOnlyString(daysOffset));
  };

  // Handlers for Exam Presets
  const handleSelectExamPreset = (daysOffset: number) => {
    triggerHaptic('selection');
    setExamActivePreset(daysOffset);
    setExamDate(getDateOnlyString(daysOffset));
  };

  const handleSave = () => {
    if (mode === 'task') {
      if (!taskTitle.trim()) return;
      if (!isValidDateString(taskDeadlineDate)) {
        Alert.alert('Tanggal Tidak Valid', 'Format tanggal harus YYYY-MM-DD yang valid (contoh: 2026-11-15).');
        return;
      }
      triggerHaptic('success');
      const taskId = generateId();
      const generated = autoBreakdown ? autoGenerateSubtasks(taskTitle.trim()) : [];
      const subtasks = generated.map((g) => ({
        id: generateId(),
        taskId: taskId,
        title: g.title,
        isCompleted: false,
        orderIdx: g.orderIdx,
      }));

      // Construct deadline ISO using local timezone
      const deadlineISO = buildLocalDeadlineISO(taskDeadlineDate, taskDeadlineTime);

      const newTask = {
        id: taskId,
        title: taskTitle.trim(),
        priority: taskPriority,
        isCompleted: false,
        deadlineDate: deadlineISO,
        createdAt: new Date().toISOString(),
        subtasks: subtasks,
        subjectId: taskSubjectId,
      };

      dispatch(addTask(newTask));
      LocalDataRepository.saveTask(newTask);

      // Schedule deadline notification reminder
      LocalNotificationService.scheduleTaskDeadlineReminder(
        taskId,
        newTask.title,
        deadlineISO
      );

      setTaskTitle('');
    } else if (mode === 'exam') {
      if (!examTitle.trim() || !examDate.trim()) return;
      if (!isValidDateString(examDate)) {
        Alert.alert('Tanggal Tidak Valid', 'Format tanggal ujian harus YYYY-MM-DD yang valid (contoh: 2026-11-15).');
        return;
      }
      triggerHaptic('success');

      const calculatedDays = Math.max(0, calculateDaysLeft(examDate));
      const chosenSubject = subjects.find((s) => s.id === examSubjectId);

      const newExam = {
        id: generateId(),
        title: examTitle.trim(),
        subjectId: examSubjectId,
        examDate: examDate.trim(),
        daysLeft: calculatedDays,
        subject: chosenSubject,
      };

      dispatch(addExam(newExam));
      LocalDataRepository.saveExam(newExam);

      // Schedule notification reminder for exam
      LocalNotificationService.scheduleExamReminder(
        newExam.id,
        newExam.title,
        examDate.trim(),
        calculatedDays
      );

      setExamTitle('');
    } else {
      if (!subjectName.trim()) return;
      triggerHaptic('success');
      const subId = generateId();
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
        id: generateId(),
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

  const examDaysLeft = calculateDaysLeft(examDate);

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
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* 3 Distinctive Mode Tabs: Tugas vs Ujian vs Mapel */}
              <View style={styles.modeTabs}>
                <TouchableOpacity
                  style={[styles.modeTab, mode === 'task' && styles.modeTabTaskActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setMode('task');
                  }}
                >
                  <CheckSquare size={13} color={mode === 'task' ? '#FFFFFF' : '#475569'} />
                  <Text style={[styles.modeTabText, mode === 'task' && styles.modeTabTextActive]}>
                    Tugas Sekolah
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeTab, mode === 'exam' && styles.modeTabExamActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setMode('exam');
                  }}
                >
                  <AlertCircle size={13} color={mode === 'exam' ? '#FFFFFF' : '#2563EB'} />
                  <Text style={[styles.modeTabText, mode === 'exam' && styles.modeTabTextActive]}>
                    Jadwal Ujian
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeTab, mode === 'subject' && styles.modeTabSubjectActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setMode('subject');
                  }}
                >
                  <Calendar size={13} color={mode === 'subject' ? '#FFFFFF' : '#475569'} />
                  <Text style={[styles.modeTabText, mode === 'subject' && styles.modeTabTextActive]}>
                    Jadwal Mapel
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.scrollableForm}
              >
                {/* 1. FORM TUGAS SEKOLAH */}
                {mode === 'task' && (
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

                    {/* Subject Chip Selector */}
                    {subjects.length > 0 && (
                      <>
                        <Text style={[styles.label, { marginTop: 12 }]}>Mata Pelajaran (Opsional)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                          {subjects.map((sub) => {
                            const isSelected = taskSubjectId === sub.id;
                            return (
                              <TouchableOpacity
                                key={sub.id}
                                style={[styles.subChip, isSelected && styles.subChipActive]}
                                onPress={() => {
                                  triggerHaptic('selection');
                                  setTaskSubjectId(isSelected ? null : sub.id);
                                }}
                              >
                                <Text style={[styles.subChipText, isSelected && styles.subChipTextActive]}>
                                  {sub.name}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </>
                    )}

                    {/* FORM INPUT DEADLINE TUGAS */}
                    <Text style={[styles.label, { marginTop: 12 }]}>Batas Waktu Pengumpulan (Deadline)</Text>
                    <View style={styles.presetRow}>
                      {[
                        { label: 'Hari Ini', offset: 0 },
                        { label: 'Besok', offset: 1 },
                        { label: 'Lusa', offset: 2 },
                        { label: '1 Minggu', offset: 7 },
                      ].map((p) => {
                        const isSelected = taskActivePreset === p.offset;
                        return (
                          <TouchableOpacity
                            key={p.offset}
                            style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                            onPress={() => handleSelectTaskPreset(p.offset)}
                          >
                            <Text style={[styles.presetBtnText, isSelected && styles.presetBtnTextActive]}>
                              {p.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Date & Time Row */}
                    <View style={styles.dateTimeRow}>
                      <View style={{ flex: 1.6 }}>
                        <View style={styles.inputWithIcon}>
                          <Calendar size={15} color="#2563EB" style={{ marginRight: 6 }} />
                          <TextInput
                            style={styles.inlineInput}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#94A3B8"
                            value={taskDeadlineDate}
                            onChangeText={(val) => {
                              setTaskDeadlineDate(val);
                              setTaskActivePreset(null);
                            }}
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <View style={styles.inputWithIcon}>
                          <Clock size={15} color="#2563EB" style={{ marginRight: 6 }} />
                          <TextInput
                            style={styles.inlineInput}
                            placeholder="23:59"
                            placeholderTextColor="#94A3B8"
                            value={taskDeadlineTime}
                            onChangeText={setTaskDeadlineTime}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Live Deadline Preview */}
                    <View style={styles.deadlinePreviewBox}>
                      <Clock size={13} color="#2563EB" style={{ marginRight: 6 }} />
                      <Text style={styles.deadlinePreviewText}>
                        Tenggat: {formatIndonesianFullDate(taskDeadlineDate)} · Pukul {taskDeadlineTime}
                      </Text>
                    </View>

                    {/* Priority Selector */}
                    <Text style={[styles.label, { marginTop: 12 }]}>Tingkat Prioritas</Text>
                    <View style={styles.priorityRow}>
                      {(['low', 'normal', 'urgent'] as const).map((p) => {
                        const isActive = taskPriority === p;
                        const label = p === 'urgent' ? 'Penting' : p === 'normal' ? 'Normal' : 'Santai';
                        return (
                          <TouchableOpacity
                            key={p}
                            style={[styles.priorityBtn, isActive && styles.priorityBtnActive]}
                            onPress={() => {
                              triggerHaptic('selection');
                              setTaskPriority(p);
                            }}
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
                      onPress={() => {
                        triggerHaptic('selection');
                        setAutoBreakdown(!autoBreakdown);
                      }}
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
                )}

                {/* 2. FORM JADWAL UJIAN (UJIAN / PTS / PAS) */}
                {mode === 'exam' && (
                  <View style={styles.formContainer}>
                    <View style={styles.examBannerNotice}>
                      <AlertCircle size={15} color="#2563EB" style={{ marginRight: 6 }} />
                      <Text style={styles.examBannerNoticeText}>
                        Jadwal Ujian adalah target evaluasi berkala dengan hitung mundur H-X dan pengingat khusus.
                      </Text>
                    </View>

                    <Text style={styles.label}>Nama Ujian / Penilaian</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Contoh: PTS Matematika Wajib"
                      placeholderTextColor="#94A3B8"
                      value={examTitle}
                      onChangeText={setExamTitle}
                      autoFocus
                    />

                    {/* Subject Chip Selector */}
                    {subjects.length > 0 && (
                      <>
                        <Text style={[styles.label, { marginTop: 12 }]}>Mata Pelajaran Terkait</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                          {subjects.map((sub) => {
                            const isSelected = examSubjectId === sub.id;
                            return (
                              <TouchableOpacity
                                key={sub.id}
                                style={[styles.subChip, isSelected && styles.subChipExamActive]}
                                onPress={() => {
                                  triggerHaptic('selection');
                                  setExamSubjectId(isSelected ? null : sub.id);
                                }}
                              >
                                <Text style={[styles.subChipText, isSelected && styles.subChipExamTextActive]}>
                                  {sub.name}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </>
                    )}

                    {/* FORM INPUT DEADLINE / TANGGAL UJIAN */}
                    <Text style={[styles.label, { marginTop: 12 }]}>
                      Tanggal Pelaksanaan Ujian (Batas Waktu)
                    </Text>
                    <View style={styles.presetRow}>
                      {[
                        { label: 'Besok (H-1)', days: 1 },
                        { label: '3 Hari (H-3)', days: 3 },
                        { label: '1 Minggu (H-7)', days: 7 },
                        { label: '2 Minggu (H-14)', days: 14 },
                      ].map((p) => {
                        const isSelected = examActivePreset === p.days;
                        return (
                          <TouchableOpacity
                            key={p.days}
                            style={[styles.presetBtn, isSelected && styles.presetBtnExamActive]}
                            onPress={() => handleSelectExamPreset(p.days)}
                          >
                            <Text style={[styles.presetBtnText, isSelected && styles.presetBtnExamTextActive]}>
                              {p.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={styles.inputWithIcon}>
                      <Calendar size={15} color="#2563EB" style={{ marginRight: 6 }} />
                      <TextInput
                        style={styles.inlineInput}
                        placeholder="YYYY-MM-DD (Contoh: 2026-11-15)"
                        placeholderTextColor="#94A3B8"
                        value={examDate}
                        onChangeText={(val) => {
                          setExamDate(val);
                          setExamActivePreset(null);
                        }}
                      />
                    </View>

                    {/* Exam Date & Countdown Preview */}
                    <View style={styles.examPreviewCard}>
                      <Text style={styles.examPreviewDate}>
                        {formatIndonesianFullDate(examDate)}
                      </Text>
                      <View style={styles.examCountdownTag}>
                        <Text style={styles.examCountdownTagText}>
                          {examDaysLeft <= 0 ? 'Hari Ini!' : `H-${examDaysLeft} (${examDaysLeft} hari lagi)`}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* 3. FORM JADWAL MATA PELAJARAN */}
                {mode === 'subject' && (
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
              </ScrollView>

              {/* Submit CTA */}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.saveBtnText}>
                  Simpan {mode === 'task' ? 'Tugas' : mode === 'exam' ? 'Jadwal Ujian' : 'Mapel'}
                </Text>
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
  scrollableForm: {
    maxHeight: 460,
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
    gap: 5,
  },
  modeTabTaskActive: {
    backgroundColor: '#2563EB',
  },
  modeTabExamActive: {
    backgroundColor: '#2563EB',
  },
  modeTabSubjectActive: {
    backgroundColor: '#0F1B33',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  formContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5670',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F1B33',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  subChipExamActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  subChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A5670',
  },
  subChipTextActive: {
    color: '#FFFFFF',
  },
  subChipExamTextActive: {
    color: '#FFFFFF',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  presetBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  presetBtnExamActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  presetBtnTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  presetBtnExamTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    height: 42,
  },
  inlineInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F1B33',
    fontWeight: '600',
  },
  deadlinePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 8,
  },
  deadlinePreviewText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
    flex: 1,
  },
  examBannerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  examBannerNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
    fontWeight: '500',
  },
  examPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 8,
  },
  examPreviewDate: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
    flex: 1,
  },
  examCountdownTag: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  examCountdownTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  priorityBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  priorityBtnTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  breakdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F1B33',
  },
  breakdownDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563EB',
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
