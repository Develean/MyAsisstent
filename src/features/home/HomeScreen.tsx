import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../store/store';
import {
  TaskWithSubtasks,
  toggleTaskCompletion,
  toggleSubtaskCompletion,
} from '../tasks/taskSlice';
import { addExp, recordDailyActivity } from '../user/userSlice';
import { setActiveTask } from '../focus/focusSlice';
import { TaskDetailModal } from '../tasks/components/TaskDetailModal';
import { LocalDataRepository } from '../../db/repository';
import {
  Flame,
  User as UserIcon,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Plus,
  Sparkles,
  BookOpen,
  AlertCircle,
  Clock,
} from 'lucide-react-native';
import { ActionFeedbackToast, ToastType } from '../../shared/components/ActionFeedbackToast';
import { formatDeadlineDisplay, formatIndonesianFullDate } from '../../shared/utils/dateUtils';
import { triggerHaptic } from '../../shared/utils/haptics';
import { getExamUrgencyConfig } from '../../shared/utils/examUrgency';
import { NotesModal } from '../notes/components/NotesModal';
import { ExamDetailModal } from '../schedule/components/ExamDetailModal';
import { AllTasksModal } from '../tasks/components/AllTasksModal';
import { ExamWithSubject } from '../schedule/scheduleSlice';

interface HomeScreenProps {
  onOpenAddModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenAddModal, onNavigateTab }) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.user);
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const schedules = useAppSelector((state) => state.schedule.schedules);
  const exams = useAppSelector((state) => state.schedule.exams);

  const [selectedTask, setSelectedTask] = useState<TaskWithSubtasks | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamWithSubject | null>(null);
  const [isAllTasksModalOpen, setIsAllTasksModalOpen] = useState(false);
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

  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);

  const showToast = (message: string, subMessage?: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, subMessage, type });
  };

  // Active uncompleted tasks
  const activeTasks = tasks.filter((t) => !t.isCompleted);

  // Filter only upcoming / today's exams for hero countdown banner (exclude past exams)
  const upcomingExams = exams
    .filter((e) => e.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const nearestExam = upcomingExams.length > 0 ? upcomingExams[0] : null;
  const examConfig = nearestExam ? getExamUrgencyConfig(nearestExam.daysLeft) : null;

  // Real date & schedules for today
  const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const now = new Date();
  const currentDayName = DAY_NAMES[now.getDay()];
  const currentDateStr = `${currentDayName}, ${now.getDate()} ${MONTH_NAMES_SHORT[now.getMonth()]}`;
  const todaySchedules = schedules.filter((s) => s.dayOfWeek === currentDayName);

  // Real EXP percentage calculation (fixed 670% bug)
  const currentExp = user.currentExp ?? 0;
  const maxExp = user.maxExp || 1000;
  const expPercentage = Math.min(100, Math.max(5, Math.round((currentExp / maxExp) * 100)));

  // Dynamic safe top & bottom padding to prevent ANY status bar overlap or floating tab bar occlusion
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    24
  ) + 10;
  const bottomScrollPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12) + 80;

  const handleToggleTask = (task: TaskWithSubtasks) => {
    const willComplete = !task.isCompleted;
    if (willComplete) {
      triggerHaptic('success');
    } else {
      triggerHaptic('light');
    }
    dispatch(toggleTaskCompletion(task.id));
    LocalDataRepository.updateTaskCompletion(task.id, willComplete);
    if (willComplete) {
      dispatch(addExp(20));
      dispatch(recordDailyActivity());
      LocalDataRepository.recordExpAndActivity(20);
      showToast('Tugas Selesai!', '+20 EXP ditambahkan ke profilmu', 'exp');
    } else {
      showToast('Status Tugas Diperbarui', 'Tugas dikembalikan ke antrean aktif', 'info');
    }
  };

  const handleQuickNote = () => {
    setIsNotesModalVisible(true);
  };

  return (
    <View style={[styles.safeArea, { paddingTop: topPadding }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomScrollPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================
            1. TOP HEADER: Streak Pill & Profile Avatar
            ========================================================= */}
        <View style={styles.topHeaderRow}>
          <View style={styles.streakPill}>
            <Flame color="#F59E0B" size={18} fill="#F59E0B" />
            <Text style={styles.streakPillText}>
              Streak {user.streakDays ?? 0} hari
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileAvatarBtn}
            onPress={() => onNavigateTab && onNavigateTab('Profil')}
            activeOpacity={0.8}
            accessibilityLabel="Buka Profil"
          >
            <UserIcon color="#0F1B33" size={20} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* =========================================================
            2. GREETING & LEVEL SCHOLAR PROGRESS BAR
            ========================================================= */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            Halo, {user.name || 'Teman Belajar'}
          </Text>
          <View style={styles.levelProgressRow}>
            <Text style={styles.levelText}>
              Level {user.currentLevel || 1} · {user.levelTitle || 'Pelajar Baru'}
            </Text>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${expPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.percentText}>{expPercentage}%</Text>
          </View>
        </View>

        {/* =========================================================
            3. HERO CARD: Hitung Mundur Ujian & Maskot Hamster (Dynamic Urgency)
            ========================================================= */}
        {nearestExam && examConfig ? (
          <TouchableOpacity
            style={[
              styles.examHeroCard,
              {
                borderColor: examConfig.cardBorder,
                backgroundColor: examConfig.cardBg,
                shadowColor: examConfig.tagColor,
              },
            ]}
            onPress={() => setSelectedExam(nearestExam)}
            activeOpacity={0.9}
          >
            <View style={styles.examHeroLeft}>
              <View style={styles.examTagRow}>
                <AlertCircle size={13} color={examConfig.tagColor} style={{ marginRight: 4 }} />
                <Text style={[styles.examTag, { color: examConfig.tagColor }]}>JADWAL UJIAN</Text>
                <View style={[styles.countdownPillSmall, { backgroundColor: examConfig.badgeBg }]}>
                  <Text style={[styles.countdownPillSmallText, { color: examConfig.badgeText }]}>
                    {examConfig.urgencyLabel}
                  </Text>
                </View>
              </View>
              <Text style={styles.examTitle} numberOfLines={2}>
                {nearestExam.subject?.name
                  ? `${nearestExam.subject.name} - ${nearestExam.title}`
                  : nearestExam.title}
              </Text>
              <View style={styles.examDateMetaRow}>
                <Calendar size={12} color={examConfig.subTextColor} style={{ marginRight: 4 }} />
                <Text style={[styles.examDateMetaText, { color: examConfig.subTextColor }]}>
                  {formatIndonesianFullDate(nearestExam.examDate)}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.reviewBtn, { backgroundColor: examConfig.btnBg }]}
                onPress={() => onNavigateTab && onNavigateTab('Fokus')}
                activeOpacity={0.85}
              >
                <Text style={styles.reviewBtnText}>Review Materi Ujian</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={examConfig.mascotImage}
              style={styles.heroMascotImg}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : null}

        {/* =========================================================
            4. JADWAL HARI INI
            ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Jadwal hari ini</Text>
          <TouchableOpacity onPress={() => onNavigateTab && onNavigateTab('Jadwal')}>
            <Text style={styles.sectionDate}>{currentDateStr}</Text>
          </TouchableOpacity>
        </View>

        {todaySchedules.length > 0 ? (
          <View style={styles.whiteCardBox}>
            {todaySchedules.map((sch, idx) => {
              const isLast = idx === todaySchedules.length - 1;
              const initial = sch.subject?.initial || sch.subject?.name?.charAt(0) || 'M';
              const bgColor = sch.subject?.bgColor || '#DBEAFE';
              const color = sch.subject?.color || '#1D4ED8';

              const curMins = now.getHours() * 60 + now.getMinutes();
              const parseM = (t?: string) => {
                if (!t) return 0;
                const [h, m] = t.split(':').map((x) => parseInt(x, 10) || 0);
                return h * 60 + m;
              };
              const isOngoing = curMins >= parseM(sch.startTime) && curMins < parseM(sch.endTime || '09:00');

              return (
                <TouchableOpacity
                  key={sch.id}
                  style={[
                    styles.scheduleRow,
                    isOngoing && { backgroundColor: '#F0FDF4' },
                    isLast && { borderBottomWidth: 0 },
                  ]}
                  onPress={() => onNavigateTab && onNavigateTab('Jadwal')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.subjectIconBox, { backgroundColor: bgColor }]}>
                    <Text style={[styles.subjectInitial, { color: color }]}>{initial}</Text>
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.subjectName} numberOfLines={1}>{sch.subject?.name || 'Mata Pelajaran'}</Text>
                      {isOngoing && (
                        <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: '#15803D' }}>Sedang Berlangsung</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>{sch.subject?.room || 'Ruang Kelas'}</Text>
                  </View>
                  <Text style={[styles.subjectTime, isOngoing && { color: '#15803D', fontWeight: '800' }]}>
                    {sch.startTime} - {sch.endTime || '09:00'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.actionableEmptyCard}>
            <View style={styles.emptyIconCircle}>
              <Calendar size={22} color="#2563EB" />
            </View>
            <Text style={styles.emptyTitle}>Hari ini belum ada jadwal pelajaran</Text>
            <Text style={styles.emptySubtitle}>
              Atur jadwal kelas mingguanmu agar maskot pintar bisa mengingatkan kelas tepat waktu.
            </Text>
            <TouchableOpacity
              style={styles.emptyCtaButton}
              onPress={onOpenAddModal}
              activeOpacity={0.85}
            >
              <Plus size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyCtaText}>Tambah Jadwal Pelajaran</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =========================================================
            5. TUGAS PRIORITAS
            ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Tugas prioritas</Text>
          <TouchableOpacity
            style={styles.taskCountBadgeBtn}
            onPress={() => setIsAllTasksModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.taskCountBadge}>{activeTasks.length} tugas</Text>
            <ChevronRight size={13} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {activeTasks.length > 0 ? (
          <View style={styles.whiteCardBoxPadded}>
            {activeTasks.slice(0, 3).map((t, idx) => {
              const isLast = idx === Math.min(activeTasks.length, 3) - 1;
              const sub = schedules.find((s) => s.subjectId === t.subjectId)?.subject;
              const initial = sub?.initial || t.title.charAt(0).toUpperCase() || 'T';
              const bgColor = sub?.bgColor || '#DBEAFE';
              const textColor = sub?.color || '#1D4ED8';

              return (
                <View
                  key={t.id}
                  style={[
                    styles.taskPriorityRow,
                    isLast && { borderBottomWidth: 0, paddingBottom: 0 },
                  ]}
                >
                  <View style={[styles.subjectIconBox, { backgroundColor: bgColor }]}>
                    <Text style={[styles.subjectInitial, { color: textColor }]}>{initial}</Text>
                  </View>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => setSelectedTask(t)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.taskTitleText} numberOfLines={1}>{t.title}</Text>
                      {t.priority === 'urgent' && (
                        <View style={styles.urgentPriorityTag}>
                          <Text style={styles.urgentPriorityText}>Penting</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 }}>
                      <Clock size={11} color="#64748B" />
                      <Text style={styles.taskDeadlineText}>Tenggat: {formatDeadlineDisplay(t.deadlineDate)}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cicilBtn}
                    onPress={() => {
                      dispatch(setActiveTask({ taskId: t.id }));
                      onNavigateTab && onNavigateTab('Fokus');
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.cicilBtnText}>Cicil</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.actionableEmptyCard}>
            <View style={[styles.emptyIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <CheckCircle2 size={22} color="#059669" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Tugas Tertunda</Text>
            <Text style={styles.emptySubtitle}>
              Semua tugasmu sudah tuntas! Catat PR atau target materi baru agar progres belajarmu terus berjalan.
            </Text>
            <TouchableOpacity
              style={[styles.emptyCtaButton, { backgroundColor: '#059669' }]}
              onPress={onOpenAddModal}
              activeOpacity={0.85}
            >
              <Plus size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyCtaText}>Buat Tugas Baru</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =========================================================
            6. QUICK ACTION: + Tambah Catatan Cepat
            ========================================================= */}
        <TouchableOpacity
          style={styles.quickNoteBtn}
          onPress={handleQuickNote}
          activeOpacity={0.85}
        >
          <Text style={styles.quickNoteText}>+ Tambah Catatan Cepat</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Task Detail Modal with Interactive Subtasks */}
      <TaskDetailModal
        task={selectedTask}
        visible={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onStartFocus={() => {
          setSelectedTask(null);
          if (onNavigateTab) onNavigateTab('Fokus');
        }}
      />

      {/* Quick Notes Management Modal */}
      <NotesModal
        visible={isNotesModalVisible}
        onClose={() => setIsNotesModalVisible(false)}
      />

      {/* Exam Detail & Management Modal */}
      <ExamDetailModal
        exam={selectedExam}
        visible={!!selectedExam}
        onClose={() => setSelectedExam(null)}
        onStartFocus={() => onNavigateTab && onNavigateTab('Fokus')}
      />

      {/* All Tasks Modal */}
      <AllTasksModal
        visible={isAllTasksModalOpen}
        onClose={() => setIsAllTasksModalOpen(false)}
        tasks={tasks}
        subjects={schedules.map((s) => s.subject)}
        onSelectTask={(task) => setSelectedTask(task)}
        onOpenQuickAdd={() => onOpenAddModal && onOpenAddModal()}
      />

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
    backgroundColor: '#F3F6FA', // Exact template background
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110, // Avoid overlapping with bottom navigation
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF1CC',
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 44,
  },
  streakPillText: {
    color: '#7A4A00',
    fontWeight: '700',
    fontSize: 14,
  },
  profileAvatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3EAF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingSection: {
    marginTop: 16,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F1B33',
  },
  levelProgressRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelText: {
    fontSize: 13,
    color: '#4A5670',
    fontWeight: '600',
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#DCE5F2',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 99,
    backgroundColor: '#2563EB',
  },
  percentText: {
    fontSize: 13,
    color: '#4A5670',
    fontWeight: '600',
  },
  examHeroCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 116,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  examHeroLeft: {
    flex: 1,
  },
  examTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  examTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.4,
  },
  countdownPillSmall: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  countdownPillSmallText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  examTitle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
    color: '#0F1B33',
  },
  examDateMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  examDateMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  reviewBtn: {
    marginTop: 10,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  heroMascotImg: {
    width: 105,
    height: 100,
    marginLeft: 8,
  },
  sectionHeaderRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5670',
  },
  sectionDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5670',
  },
  taskCountBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  taskCountBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  whiteCardBox: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  whiteCardBoxPadded: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  subjectIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectInitial: {
    fontSize: 15,
    fontWeight: '800',
  },
  subjectName: {
    flex: 1,
    fontWeight: '700',
    fontSize: 15,
    color: '#0F1B33',
  },
  subjectTime: {
    fontSize: 13,
    color: '#4A5670',
    fontWeight: '600',
  },
  taskPriorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
    marginBottom: 8,
  },
  taskTitleText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#0F1B33',
  },
  urgentPriorityTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  urgentPriorityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  taskDeadlineText: {
    fontSize: 12,
    color: '#4A5670',
    fontWeight: '500',
    marginTop: 2,
  },
  cicilBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cicilBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  quickNoteBtn: {
    marginTop: 12,
    width: '100%',
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E3EAF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNoteText: {
    color: '#0F1B33',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyCardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },
  emptyCardText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionableEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    marginTop: 6,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
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
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  emptyCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
