import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useAppSelector, useAppDispatch } from '../../store/store';
import {
  setDuration,
  setCustomDuration,
  togglePlayPause,
  resetTimer,
  tick,
  setActiveTask,
  clearActiveTask,
} from './focusSlice';
import {
  toggleSubtaskCompletion,
  addSubtask,
  TaskWithSubtasks,
} from '../tasks/taskSlice';
import { addExp } from '../user/userSlice';
import {
  Play,
  Pause,
  Square,
  Sparkles,
  ChevronDown,
  X,
  Plus,
  Info,
} from 'lucide-react-native';
import { AnimatedCheckbox } from '../../shared/components/AnimatedCheckbox';
import { ActionFeedbackToast, ToastType } from '../../shared/components/ActionFeedbackToast';

export const FocusScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const focus = useAppSelector((state) => state.focus);
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const subjects = useAppSelector((state) => state.schedule.subjects);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
  const [sessionCompletedCelebration, setSessionCompletedCelebration] = useState(false);

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

  // Live Timer Breathing Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (focus.isRunning) {
      animLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      animLoop.start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [focus.isRunning, pulseAnim]);

  const getTaskSubjectName = (task?: TaskWithSubtasks) => {
    if (!task) return 'Fisika';
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

  // Timer Tick Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (focus.isRunning) {
      interval = setInterval(() => {
        dispatch(tick());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focus.isRunning, dispatch]);

  // Handle session completion reward
  useEffect(() => {
    if (focus.remainingSeconds === 0 && !focus.isRunning) {
      dispatch(addExp(10));
      setSessionCompletedCelebration(true);
      showToast('Sesi Fokus Tuntas!', '+10 EXP berhasil diklaim', 'exp');
      setTimeout(() => setSessionCompletedCelebration(false), 4500);
    }
  }, [focus.remainingSeconds, focus.isRunning, dispatch]);

  // Active task selection: strictly based on activeTaskId (no fake/dummy fallback)
  const activeTask = focus.activeTaskId
    ? tasks.find((t) => t.id === focus.activeTaskId) || null
    : null;

  // Real subtasks from active task (no dummy items)
  const subtasks = activeTask?.subtasks || [];

  const completedSubtasksCount = subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasksCount = subtasks.length;

  // Format mm:ss
  const minutes = Math.floor(focus.remainingSeconds / 60);
  const seconds = focus.remainingSeconds % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Calculate circular progress
  const totalSeconds = (focus.durationMinutes || 25) * 60;
  const progressRatio = totalSeconds > 0
    ? Math.max(0, Math.min(1, (totalSeconds - focus.remainingSeconds) / totalSeconds))
    : 0;
  const circumference = 2 * Math.PI * 100; // r = 100
  const strokeDashoffset = circumference * (1 - progressRatio);

  const handleToggleSubtask = (subtaskId: number, currentCompleted: boolean) => {
    if (activeTask) {
      dispatch(toggleSubtaskCompletion({ taskId: activeTask.id, subtaskId }));
      if (!currentCompleted) {
        dispatch(addExp(5));
        showToast('Langkah Mini Tuntas!', '+5 EXP ditambahkan', 'exp');
      } else {
        showToast('Subtask Diperbarui', 'Subtask dikembalikan', 'info');
      }
    }
  };

  const handleAddNewSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    if (activeTask) {
      const title = newSubtaskTitle.trim();
      dispatch(addSubtask({ taskId: activeTask.id, title }));
      showToast('Langkah Ditambahkan', title, 'info');
      setNewSubtaskTitle('');
    } else {
      Alert.alert('Info', 'Pilih tugas terlebih dahulu untuk menambahkan subtask.');
    }
  };

  const handleSelectPreset = (mins: number) => {
    dispatch(setDuration(mins));
    showToast('Durasi Disetel', `${mins} menit sesi fokus`, 'info');
  };

  const handleTogglePlay = () => {
    const nextRunning = !focus.isRunning;
    dispatch(togglePlayPause());
    if (nextRunning) {
      showToast('Timer Dimulai', 'Fokus dan kurangi distraksi!', 'info');
    } else {
      showToast('Timer Dijeda', 'Istirahat sejenak atau lanjutkan kembali', 'info');
    }
  };

  const handleResetTimer = () => {
    dispatch(resetTimer());
    showToast('Timer Direset', `Waktu dikembalikan ke ${focus.durationMinutes || 25} menit`, 'info');
  };

  const handleApplyCustomMinutes = () => {
    const val = parseInt(customInputText, 10);
    if (isNaN(val) || val <= 0 || val > 180) {
      Alert.alert('Durasi Tidak Valid', 'Masukkan angka durasi antara 1 sampai 180 menit.');
      return;
    }
    dispatch(setCustomDuration(val));
    setIsCustomModalOpen(false);
    setCustomInputText('');
    showToast('Durasi Kustom Disetel', `${val} menit sesi fokus`, 'info');
  };

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    24
  ) + 10;

  return (
    <View style={[styles.safeArea, { paddingTop: topPadding }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Mode fokus (Centered clean title) */}
        <View style={styles.header}>
          <Text style={styles.title}>Mode fokus</Text>
        </View>

        {/* Celebration Banner when timer finishes */}
        {sessionCompletedCelebration && (
          <View style={styles.celebrationBanner}>
            <Sparkles size={18} color="#059669" />
            <Text style={styles.celebrationText}>
              Sesi Fokus Tuntas! Kamu mendapatkan +10 EXP
            </Text>
          </View>
        )}

        {/* Card: Sedang dikerjakan (HANYA MUNCUL JIKA ADA TUGAS YANG DIKERJAKAN) */}
        {activeTask ? (
          <TouchableOpacity
            style={styles.taskCard}
            activeOpacity={0.9}
            onPress={() => setIsTaskPickerOpen(true)}
          >
            <View style={styles.taskBadgeBox}>
              <Text style={styles.taskBadgeText}>
                {getTaskSubjectName(activeTask).charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskCardLabel}>Sedang dikerjakan</Text>
              <Text style={styles.taskCardTitle} numberOfLines={1}>
                {activeTask.title}
              </Text>
            </View>
            <ChevronDown size={18} color="#4A5670" />
          </TouchableOpacity>
        ) : tasks.filter((t) => !t.isCompleted).length > 0 ? (
          <TouchableOpacity
            style={styles.chooseTaskPillBtn}
            onPress={() => setIsTaskPickerOpen(true)}
            activeOpacity={0.8}
          >
            <Sparkles size={14} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={styles.chooseTaskPillText}>+ Kaitkan dengan Tugas (Opsional)</Text>
          </TouchableOpacity>
        ) : null}

        {/* Circular Timer Ring with Live Pulse when Running */}
        <Animated.View
          style={[
            styles.timerRingContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {focus.isRunning && <View style={styles.timerPulsingHalo} />}
          <Svg width={240} height={240} viewBox="0 0 240 240" style={styles.timerSvg}>
            {/* Background Track Circle */}
            <Circle
              cx={120}
              cy={120}
              r={100}
              stroke="#DCE5F2"
              strokeWidth={16}
              fill="none"
            />
            {/* Blue Progress Stroke */}
            <Circle
              cx={120}
              cy={120}
              r={100}
              stroke="#2563EB"
              strokeWidth={16}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 120 120)"
            />
          </Svg>
          <View style={styles.timerCenterTextContainer}>
            <Text style={styles.timerDigits}>{timeString}</Text>
            <Text style={styles.timerSubLabel}>
              dari {focus.durationMinutes || 25} menit
            </Text>
            {focus.isRunning ? (
              <View style={styles.timerRunningIndicator}>
                <View style={styles.timerRunningDot} />
                <Text style={styles.timerRunningText}>Sedang Berjalan</Text>
              </View>
            ) : (
              <View style={styles.timerPausedIndicator}>
                <Text style={styles.timerPausedText}>Siap Belajar</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Duration Chips (25 mnt / 50 mnt / Kustom) */}
        <View style={styles.presetChipsRow}>
          <TouchableOpacity
            style={[
              styles.presetChip,
              focus.durationMinutes === 25 && styles.presetChipActive,
            ]}
            onPress={() => handleSelectPreset(25)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.presetChipText,
                focus.durationMinutes === 25 && styles.presetChipTextActive,
              ]}
            >
              25 mnt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.presetChip,
              focus.durationMinutes === 50 && styles.presetChipActive,
            ]}
            onPress={() => handleSelectPreset(50)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.presetChipText,
                focus.durationMinutes === 50 && styles.presetChipTextActive,
              ]}
            >
              50 mnt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.presetChip,
              focus.durationMinutes !== 25 &&
                focus.durationMinutes !== 50 &&
                styles.presetChipActive,
            ]}
            onPress={() => setIsCustomModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.presetChipText,
                focus.durationMinutes !== 25 &&
                  focus.durationMinutes !== 50 &&
                  styles.presetChipTextActive,
              ]}
            >
              {focus.durationMinutes !== 25 && focus.durationMinutes !== 50
                ? `${focus.durationMinutes} mnt`
                : 'Kustom'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons (Pause / Play & Stop as in Image) */}
        <View style={styles.actionButtonsRow}>
          {/* Big Blue Play / Pause Button: 76x76px */}
          <TouchableOpacity
            style={styles.mainPlayPauseButton}
            onPress={handleTogglePlay}
            activeOpacity={0.85}
          >
            {focus.isRunning ? (
              <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={28} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
            )}
          </TouchableOpacity>

          {/* Secondary Stop / Reset Button: 56x56px */}
          <TouchableOpacity
            style={styles.secondaryStopButton}
            onPress={handleResetTimer}
            activeOpacity={0.8}
          >
            <Square size={20} color="#0F1B33" fill="#0F1B33" />
          </TouchableOpacity>
        </View>

        {/* BOX SUBTASK (HANYA MUNCUL JIKA ADA TUGAS YANG DIKERJAKAN) */}
        {activeTask ? (
          <View style={styles.subtaskCard}>
            <View style={styles.subtaskHeaderRow}>
              <Text style={styles.subtaskTitle}>Subtask / Langkah Kerja</Text>
              <View style={styles.subtaskProgressBadge}>
                <Text style={styles.subtaskProgressText}>
                  {completedSubtasksCount} dari {totalSubtasksCount} tuntas
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
                      onPress={() => handleToggleSubtask(item.id, item.isCompleted)}
                      size={20}
                    />
                    <Text
                      style={[
                        styles.subtaskItemText,
                        item.isCompleted && styles.subtaskItemTextDone,
                      ]}
                      onPress={() => handleToggleSubtask(item.id, item.isCompleted)}
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
                onChangeText={setNewSubtaskTitle}
                onSubmitEditing={handleAddNewSubtask}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addSubtaskBtn}
                onPress={handleAddNewSubtask}
                activeOpacity={0.8}
              >
                <Text style={styles.addSubtaskBtnText}>+ Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* GUIDANCE EMPTY STATE: Mode Fokus Bebas / Belajar Mandiri */
          <View style={styles.freeFocusGuidanceCard}>
            <View style={styles.guidanceIconCircle}>
              <Sparkles size={24} color="#2563EB" />
            </View>
            <Text style={styles.guidanceTitle}>Mode Belajar Mandiri Aktif</Text>
            <Text style={styles.guidanceSubtitle}>
              Timer Pomodoro siap menemani sesi belajar bebasmu. Ingin checklist langkah kerja terstruktur? Kaitkan dengan tugas aktif di bawah.
            </Text>
            {tasks.filter((t) => !t.isCompleted).length > 0 ? (
              <TouchableOpacity
                style={styles.guidanceCtaBtn}
                onPress={() => setIsTaskPickerOpen(true)}
                activeOpacity={0.85}
              >
                <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.guidanceCtaText}>
                  Kaitkan dengan Tugas ({tasks.filter((t) => !t.isCompleted).length} Tugas Aktif)
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.guidanceTipsBox}>
                <Info size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.guidanceTipsText}>
                  Belum ada tugas terdaftar. Belajar mandiri tetap menghasilkan EXP setiap sesi tuntas!
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Task Picker Modal */}
      <Modal
        visible={isTaskPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsTaskPickerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tugas untuk Difokuskan</Text>
              <TouchableOpacity onPress={() => setIsTaskPickerOpen(false)}>
                <X size={20} color="#0F1B33" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {/* Option to clear active task / focus without linked task */}
              <TouchableOpacity
                style={[
                  styles.taskOptionRow,
                  activeTask === null && styles.taskOptionRowSelected,
                ]}
                onPress={() => {
                  dispatch(clearActiveTask());
                  setIsTaskPickerOpen(false);
                }}
              >
                <Text style={[styles.taskOptionSubject, { color: '#64748B' }]}>[Bebas]</Text>
                <Text style={styles.taskOptionTitle}>Fokus Mandiri (Tanpa Tugas Terkait)</Text>
              </TouchableOpacity>

              {tasks.length === 0 ? (
                <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: '#94A3B8', fontWeight: '600' }}>
                    Belum ada tugas yang dibuat.
                  </Text>
                </View>
              ) : (
                tasks.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.taskOptionRow,
                      activeTask?.id === t.id && styles.taskOptionRowSelected,
                    ]}
                    onPress={() => {
                      dispatch(setActiveTask({ taskId: t.id }));
                      setIsTaskPickerOpen(false);
                    }}
                  >
                    <Text style={styles.taskOptionSubject}>[{getTaskSubjectName(t)}]</Text>
                    <Text style={styles.taskOptionTitle} numberOfLines={1}>
                      {t.title}
                    </Text>
                    {t.isCompleted && (
                      <Text style={styles.taskCompletedTag}>Selesai</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Duration Modal */}
      <Modal
        visible={isCustomModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsCustomModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Atur Durasi Kustom</Text>
              <TouchableOpacity onPress={() => setIsCustomModalOpen(false)}>
                <X size={20} color="#0F1B33" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Tentukan waktu sesi fokusmu (1 - 180 menit):
            </Text>
            <TextInput
              style={styles.customMinutesInput}
              keyboardType="number-pad"
              placeholder="Contoh: 35"
              placeholderTextColor="#94A3B8"
              value={customInputText}
              onChangeText={setCustomInputText}
            />
            <View style={styles.quickMinutesRow}>
              {[15, 30, 45, 60, 90].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.quickMinChip}
                  onPress={() => setCustomInputText(m.toString())}
                >
                  <Text style={styles.quickMinText}>{m}m</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.applyCustomBtn}
              onPress={handleApplyCustomMinutes}
            >
              <Text style={styles.applyCustomBtnText}>Terapkan Durasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Action Feedback Toast */}
      <ActionFeedbackToast
        visible={toast.visible}
        message={toast.message}
        subMessage={toast.subMessage}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
        topOffset={topPadding + 10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F1B33',
    textAlign: 'center',
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  celebrationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    flex: 1,
  },
  taskCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBF0F7',
  },
  chooseTaskPillBtn: {
    marginTop: 6,
    marginBottom: 6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chooseTaskPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptySubtaskHint: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '500',
  },
  taskBadgeBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  taskCardLabel: {
    fontSize: 12,
    color: '#4A5670',
    fontWeight: '600',
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1B33',
    marginTop: 2,
  },
  timerRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
    height: 240,
  },
  timerSvg: {
    position: 'absolute',
  },
  timerCenterTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDigits: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1.5,
    color: '#0F1B33',
    lineHeight: 60,
  },
  timerSubLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5670',
    marginTop: 4,
  },
  presetChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E3EAF4',
    minWidth: 72,
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: '#2563EB',
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5670',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 18,
  },
  mainPlayPauseButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  secondaryStopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3EAF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCard: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBF0F7',
  },
  subtaskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtaskTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1B33',
  },
  subtaskProgressBadge: {
    fontSize: 11,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  subtaskProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  subtaskList: {
    gap: 6,
  },
  subtaskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F6FA',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  subtaskItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F1B33',
    flex: 1,
  },
  subtaskItemTextDone: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addSubtaskRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  subtaskInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#DCE5F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: '#F8FAFC',
    color: '#0F1B33',
  },
  addSubtaskBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSubtaskBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
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
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1B33',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#4A5670',
    marginBottom: 10,
  },
  taskOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F6FA',
  },
  taskOptionRowSelected: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  taskOptionSubject: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  taskOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F1B33',
    flex: 1,
  },
  taskCompletedTag: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
  },
  customMinutesInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#DCE5F2',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: '#F8FAFC',
    color: '#0F1B33',
    marginBottom: 12,
  },
  quickMinutesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickMinChip: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E3EAF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickMinText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1B33',
  },
  applyCustomBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCustomBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  timerPulsingHalo: {
    position: 'absolute',
    width: 216,
    height: 216,
    borderRadius: 108,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  timerRunningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 6,
  },
  timerRunningDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  timerRunningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  timerPausedIndicator: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  timerPausedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  freeFocusGuidanceCard: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  guidanceIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  guidanceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F1B33',
    textAlign: 'center',
    marginBottom: 6,
  },
  guidanceSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  guidanceCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  guidanceCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  guidanceTipsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  guidanceTipsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 16,
    flexShrink: 1,
  },
});
