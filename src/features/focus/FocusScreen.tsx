import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/store';
import {
  setDuration,
  setTimerMode,
  setCustomDuration,
  togglePlayPause,
  resetTimer,
  tick,
  clearActiveTask,
  setActiveTask,
} from './focusSlice';
import { addExp } from '../user/userSlice';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Sparkles,
  Sliders,
  Timer,
  ChevronDown,
  X,
} from 'lucide-react-native';

const POMODORO_PRESETS = [
  { label: '25m Fokus', minutes: 25, type: 'focus' },
  { label: '50m Deep Work', minutes: 50, type: 'focus' },
  { label: '5m Istirahat', minutes: 5, type: 'break' },
  { label: '15m Istirahat Panjang', minutes: 15, type: 'break' },
];

const CUSTOM_QUICK_CHIPS = [10, 15, 30, 45, 60, 90, 120];

export const FocusScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const focus = useAppSelector((state) => state.focus);
  const tasks = useAppSelector((state) => state.tasks.tasks);

  const [customInputMins, setCustomInputMins] = useState('');
  const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
  const [sessionCompletedCelebration, setSessionCompletedCelebration] = useState(false);

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
      // Award EXP for completing a focus session
      dispatch(addExp(10));
      setSessionCompletedCelebration(true);
      setTimeout(() => setSessionCompletedCelebration(false), 4500);
    }
  }, [focus.remainingSeconds, focus.isRunning, dispatch]);

  // Format mm:ss
  const minutes = Math.floor(focus.remainingSeconds / 60);
  const seconds = focus.remainingSeconds % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Calculate progress percent
  const totalSeconds = focus.durationMinutes * 60;
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(((totalSeconds - focus.remainingSeconds) / totalSeconds) * 100))
  );

  // Find linked task if any
  const linkedTask = tasks.find((t) => t.id === focus.activeTaskId);
  const activePendingTasks = tasks.filter((t) => !t.isCompleted);

  const handleApplyCustomInput = () => {
    const val = parseInt(customInputMins, 10);
    if (isNaN(val) || val <= 0 || val > 180) {
      Alert.alert('Durasi Tidak Valid', 'Masukkan angka antara 1 sampai 180 menit.');
      return;
    }
    dispatch(setCustomDuration(val));
    setCustomInputMins('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mode Timer Fokus</Text>
          <Text style={styles.subtitle}>
            Fokus belajar tanpa distraksi dan kumpulkan EXP reward (+10 EXP)
          </Text>
        </View>

        {/* Celebration Banner when timer finishes */}
        {sessionCompletedCelebration && (
          <View style={styles.celebrationBanner}>
            <Sparkles size={18} color="#059669" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.celebrationTitle}>Sesi Fokus Berhasil Diselesaikan! 🎉</Text>
              <Text style={styles.celebrationDesc}>
                Kamu mendapat +10 EXP! Istirahatkan mata sejenak sebelum lanjut ya.
              </Text>
            </View>
          </View>
        )}

        {/* Mode Selector Tabs (Pomodoro vs Custom) */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tabBtn, focus.timerMode === 'pomodoro' && styles.tabBtnActive]}
            onPress={() => {
              dispatch(setTimerMode('pomodoro'));
              dispatch(setDuration(25));
            }}
          >
            <Timer
              size={14}
              color={focus.timerMode === 'pomodoro' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.tabBtnText,
                focus.timerMode === 'pomodoro' && styles.tabBtnTextActive,
              ]}
            >
              Pomodoro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, focus.timerMode === 'custom' && styles.tabBtnActive]}
            onPress={() => {
              dispatch(setTimerMode('custom'));
              dispatch(setCustomDuration(30));
            }}
          >
            <Sliders
              size={14}
              color={focus.timerMode === 'custom' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.tabBtnText,
                focus.timerMode === 'custom' && styles.tabBtnTextActive,
              ]}
            >
              Timer Kustom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Presets based on mode */}
        {focus.timerMode === 'pomodoro' ? (
          <View style={styles.presetsGrid}>
            {POMODORO_PRESETS.map((p) => {
              const isSelected = focus.durationMinutes === p.minutes;
              return (
                <TouchableOpacity
                  key={p.label}
                  style={[
                    styles.presetCard,
                    isSelected && styles.presetCardActive,
                    p.type === 'break' && styles.presetCardBreak,
                    isSelected && p.type === 'break' && styles.presetCardBreakActive,
                  ]}
                  onPress={() => dispatch(setDuration(p.minutes))}
                >
                  <Text
                    style={[
                      styles.presetLabel,
                      isSelected && styles.presetLabelActive,
                      p.type === 'break' && { color: '#059669' },
                      isSelected && p.type === 'break' && { color: '#FFFFFF' },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.customSection}>
            <Text style={styles.customSubtitle}>Pilih Durasi Cepat atau Ketik Menit Bebas:</Text>
            {/* Quick Chips */}
            <View style={styles.chipsRow}>
              {CUSTOM_QUICK_CHIPS.map((mins) => {
                const isSelected = focus.durationMinutes === mins;
                return (
                  <TouchableOpacity
                    key={mins}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => dispatch(setCustomDuration(mins))}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {mins}m
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Manual Minutes Input */}
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Durasi bebas (menit)..."
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={customInputMins}
                onChangeText={setCustomInputMins}
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyCustomInput}
              >
                <Text style={styles.applyBtnText}>Terapkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Large Timer Dial Card */}
        <View style={styles.timerDialCard}>
          <View style={styles.progressRingWrapper}>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{timeString}</Text>
              <Text style={styles.timerSubText}>
                {focus.isRunning ? '🔥 Sedang Berjalan...' : 'Siap Mulai'}
              </Text>
              {totalSeconds > 0 && (
                <Text style={styles.progressPercentText}>{progressPercent}% selesai</Text>
              )}
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.resetBtn} onPress={() => dispatch(resetTimer())}>
              <RotateCcw size={22} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playBtn, focus.isRunning && styles.playBtnActive]}
              onPress={() => dispatch(togglePlayPause())}
            >
              {focus.isRunning ? (
                <Pause size={28} color="#FFFFFF" />
              ) : (
                <Play size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>

            <View style={{ width: 44 }} />
          </View>
        </View>

        {/* Target Task Card */}
        <View style={styles.taskTargetCard}>
          <View style={styles.taskTargetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} color="#2563EB" />
              <Text style={styles.taskTargetTitle}>Tugas yang Difokuskan</Text>
            </View>
            <TouchableOpacity
              style={styles.changeTaskBtn}
              onPress={() => setIsTaskPickerOpen(!isTaskPickerOpen)}
            >
              <Text style={styles.changeTaskBtnText}>
                {linkedTask ? 'Ganti' : '+ Pilih Tugas'}
              </Text>
              <ChevronDown size={14} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {linkedTask ? (
            <View style={styles.selectedTaskRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTargetDesc}>{linkedTask.title}</Text>
                {linkedTask.subtasks.length > 0 && (
                  <Text style={styles.taskTargetSubinfo}>
                    {linkedTask.subtasks.filter((s) => s.isCompleted).length}/
                    {linkedTask.subtasks.length} subtask selesai
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => dispatch(clearActiveTask())}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.taskTargetPlaceholder}>
              Belum ada tugas yang dikaitkan. Kamu bisa memilih tugas untuk memantau progres langsung selama sesi fokus.
            </Text>
          )}

          {/* Task Picker Dropdown */}
          {isTaskPickerOpen && (
            <View style={styles.pickerBox}>
              <Text style={styles.pickerHeader}>Pilih dari tugas yang belum tuntas:</Text>
              {activePendingTasks.length === 0 ? (
                <Text style={styles.pickerEmpty}>Tidak ada tugas pending.</Text>
              ) : (
                activePendingTasks.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      dispatch(setActiveTask({ taskId: t.id }));
                      setIsTaskPickerOpen(false);
                    }}
                  >
                    <Text style={styles.pickerItemTitle}>{t.title}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  container: {
    padding: 18,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1B33',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  celebrationDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  presetCardActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  presetCardBreak: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  presetCardBreakActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  presetLabelActive: {
    color: '#FFFFFF',
  },
  customSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  customSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customInput: {
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
  applyBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timerDialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  progressRingWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#DBEAFE',
  },
  timerCircle: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1E3A8A',
    letterSpacing: 1,
  },
  timerSubText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '700',
    marginTop: 4,
  },
  progressPercentText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 20,
  },
  resetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  playBtnActive: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  taskTargetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  taskTargetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTargetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1B33',
  },
  changeTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  changeTaskBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  selectedTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskTargetDesc: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  taskTargetSubinfo: {
    fontSize: 11,
    color: '#2563EB',
    marginTop: 2,
    fontWeight: '600',
  },
  taskTargetPlaceholder: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  pickerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 6,
  },
  pickerHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  pickerEmpty: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  pickerItem: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerItemTitle: {
    fontSize: 13,
    color: '#0F1B33',
    fontWeight: '600',
  },
});
