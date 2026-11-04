import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  Animated,
  AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../store/store';
import {
  setDuration,
  setCustomDuration,
  togglePlayPause,
  resetTimer,
  tick,
  syncFromBackground,
  setActiveTask,
  clearActiveTask,
} from './focusSlice';
import {
  toggleSubtaskCompletion,
  addSubtask,
  TaskWithSubtasks,
} from '../tasks/taskSlice';
import { addExp, recordDailyActivity } from '../user/userSlice';
import { LocalDataRepository } from '../../db/repository';
import { LocalNotificationService } from '../../shared/notifications/notificationService';
import { generateId } from '../../shared/utils/idGenerator';
import { Sparkles, ChevronDown } from 'lucide-react-native';
import { ActionFeedbackToast, ToastType } from '../../shared/components/ActionFeedbackToast';

// Modular Focus Components
import { TimerRing } from './components/TimerRing';
import { DurationChips } from './components/DurationChips';
import { FocusControls } from './components/FocusControls';
import { FocusSubtaskList } from './components/FocusSubtaskList';
import { FreeFocusGuidance } from './components/FreeFocusGuidance';
import { TaskPickerModal } from './components/TaskPickerModal';
import { CustomDurationModal } from './components/CustomDurationModal';

export const FocusScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const focus = useAppSelector((state) => state.focus);
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const subjects = useAppSelector((state) => state.schedule.subjects);
  const user = useAppSelector((state) => state.user);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
  const [sessionCompletedCelebration, setSessionCompletedCelebration] = useState(false);

  const focusNotificationIdRef = useRef<string | null>(null);

  // Action Feedback Toast State
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

  // Background Recovery: sync wall-clock on app resume
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        dispatch(syncFromBackground());
      }
    });
    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  // Wall-clock Timer Tick
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

  // Active task selection
  const activeTask = focus.activeTaskId
    ? tasks.find((t) => t.id === focus.activeTaskId) || null
    : null;

  // Handle session completion reward
  useEffect(() => {
    if (focus.remainingSeconds === 0 && !focus.isRunning) {
      dispatch(addExp(10));
      dispatch(recordDailyActivity());

      // Persist streak to SQLite
      const today = new Date().toISOString().split('T')[0];
      const currentProfile = LocalDataRepository.loadUserProfile();
      if (currentProfile) {
        LocalDataRepository.saveUserProfile({
          ...currentProfile,
          currentExp: user.currentExp + 10,
          streakDays: currentProfile.lastActiveDate === today ? currentProfile.streakDays : currentProfile.streakDays + 1,
          lastActiveDate: today,
        });
      }

      setSessionCompletedCelebration(true);
      showToast('Sesi Fokus Tuntas!', '+10 EXP berhasil diklaim & streak diperbarui', 'exp');
      setTimeout(() => setSessionCompletedCelebration(false), 4500);
    }
  }, [focus.remainingSeconds, focus.isRunning, dispatch]);

  // Subtask Handlers with SQLite persistence
  const handleToggleSubtask = (subtaskId: number, currentCompleted: boolean) => {
    if (activeTask) {
      dispatch(toggleSubtaskCompletion({ taskId: activeTask.id, subtaskId }));
      LocalDataRepository.updateSubtaskCompletion(subtaskId, !currentCompleted);

      if (!currentCompleted) {
        dispatch(addExp(5));
        dispatch(recordDailyActivity());
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
      const newSubtask = {
        id: generateId(),
        taskId: activeTask.id,
        title,
        isCompleted: false,
        orderIdx: activeTask.subtasks.length,
      };
      dispatch(addSubtask({ taskId: activeTask.id, title }));
      LocalDataRepository.saveSubtask(newSubtask);
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

  const handleTogglePlay = async () => {
    const nextRunning = !focus.isRunning;
    dispatch(togglePlayPause());
    if (nextRunning) {
      showToast('Timer Dimulai', 'Fokus dan kurangi distraksi!', 'info');
      const notifId = await LocalNotificationService.scheduleFocusEndReminder(
        focus.remainingSeconds,
        activeTask?.title
      );
      if (notifId) focusNotificationIdRef.current = notifId;
    } else {
      showToast('Timer Dijeda', 'Istirahat sejenak atau lanjutkan kembali', 'info');
      if (focusNotificationIdRef.current) {
        await LocalNotificationService.cancelNotification(focusNotificationIdRef.current);
        focusNotificationIdRef.current = null;
      }
    }
  };

  const handleResetTimer = async () => {
    dispatch(resetTimer());
    if (focusNotificationIdRef.current) {
      await LocalNotificationService.cancelNotification(focusNotificationIdRef.current);
      focusNotificationIdRef.current = null;
    }
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

  const getTaskSubjectName = (task?: TaskWithSubtasks | null) => {
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

  // Format mm:ss & circular progress
  const minutes = Math.floor(focus.remainingSeconds / 60);
  const seconds = focus.remainingSeconds % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const totalSeconds = (focus.durationMinutes || 25) * 60;
  const progressRatio = totalSeconds > 0
    ? Math.max(0, Math.min(1, (totalSeconds - focus.remainingSeconds) / totalSeconds))
    : 0;
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    24
  ) + 10;

  return (
    <View style={[styles.safeArea, { paddingTop: topPadding }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mode fokus</Text>
        </View>

        {/* Celebration Banner */}
        {sessionCompletedCelebration && (
          <View style={styles.celebrationBanner}>
            <Sparkles size={18} color="#059669" />
            <Text style={styles.celebrationText}>
              Sesi Fokus Tuntas! Kamu mendapatkan +10 EXP
            </Text>
          </View>
        )}

        {/* Active Task Card or Link Task Pill */}
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

        {/* 1. Timer Ring Component */}
        <TimerRing
          timeString={timeString}
          durationMinutes={focus.durationMinutes}
          isRunning={focus.isRunning}
          strokeDashoffset={strokeDashoffset}
          circumference={circumference}
          pulseAnim={pulseAnim}
        />

        {/* 2. Duration Chips Component */}
        <DurationChips
          durationMinutes={focus.durationMinutes}
          onSelectPreset={handleSelectPreset}
          onOpenCustomModal={() => setIsCustomModalOpen(true)}
        />

        {/* 3. Focus Controls (Play/Pause & Reset) */}
        <FocusControls
          isRunning={focus.isRunning}
          onTogglePlay={handleTogglePlay}
          onResetTimer={handleResetTimer}
        />

        {/* 4. Subtasks List or Free Guidance Component */}
        {activeTask ? (
          <FocusSubtaskList
            subtasks={activeTask.subtasks || []}
            onToggleSubtask={handleToggleSubtask}
            newSubtaskTitle={newSubtaskTitle}
            onChangeNewSubtaskTitle={setNewSubtaskTitle}
            onAddNewSubtask={handleAddNewSubtask}
          />
        ) : (
          <FreeFocusGuidance
            activeTasksCount={tasks.filter((t) => !t.isCompleted).length}
            onOpenTaskPicker={() => setIsTaskPickerOpen(true)}
          />
        )}
      </ScrollView>

      {/* Task Picker Modal */}
      <TaskPickerModal
        visible={isTaskPickerOpen}
        onClose={() => setIsTaskPickerOpen(false)}
        activeTaskId={focus.activeTaskId}
        tasks={tasks}
        subjects={subjects}
        onSelectTask={(id) => dispatch(setActiveTask({ taskId: id }))}
        onClearTask={() => dispatch(clearActiveTask())}
      />

      {/* Custom Duration Modal */}
      <CustomDurationModal
        visible={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        customInputText={customInputText}
        onChangeCustomInputText={setCustomInputText}
        onApplyCustomMinutes={handleApplyCustomMinutes}
      />

      {/* Action Feedback Toast */}
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F1B33',
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  celebrationText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 13,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF4FB',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    marginBottom: 10,
  },
  taskBadgeBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  taskCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1B33',
    marginTop: 1,
  },
  chooseTaskPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 10,
  },
  chooseTaskPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
});

export default FocusScreen;
