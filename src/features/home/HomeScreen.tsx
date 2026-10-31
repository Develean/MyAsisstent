import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/store';
import {
  TaskWithSubtasks,
  toggleTaskCompletion,
  toggleSubtaskCompletion,
} from '../tasks/taskSlice';
import { addExp } from '../user/userSlice';
import { TaskDetailModal } from '../tasks/components/TaskDetailModal';
import {
  Flame,
  User as UserIcon,
  ChevronRight,
} from 'lucide-react-native';

interface HomeScreenProps {
  onOpenAddModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenAddModal, onNavigateTab }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const schedules = useAppSelector((state) => state.schedule.schedules);
  const exams = useAppSelector((state) => state.schedule.exams);

  const [selectedTask, setSelectedTask] = useState<TaskWithSubtasks | null>(null);

  // Active uncompleted tasks
  const activeTasks = tasks.filter((t) => !t.isCompleted);

  // Nearest exam for hero countdown banner
  const nearestExam = exams.length > 0 ? exams[0] : null;

  const handleToggleTask = (task: TaskWithSubtasks) => {
    const willComplete = !task.isCompleted;
    dispatch(toggleTaskCompletion(task.id));
    if (willComplete) {
      dispatch(addExp(20));
    }
  };

  const handleQuickNote = () => {
    Alert.alert(
      'Catatan Cepat',
      'Fitur catatan cepat aktif! Ingin mencatat pengingat materi atau tugas baru?',
      [
        { text: 'Tutup', style: 'cancel' },
        { text: '+ Tambah Tugas', onPress: onOpenAddModal },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================
            1. TOP HEADER: Streak Pill & Profile Avatar
            ========================================================= */}
        <View style={styles.topHeaderRow}>
          <View style={styles.streakPill}>
            <Flame color="#F59E0B" size={18} fill="#F59E0B" />
            <Text style={styles.streakPillText}>
              Streak {user.streakDays || 4} hari
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
            Halo, {user.name || 'Develean'}
          </Text>
          <View style={styles.levelProgressRow}>
            <Text style={styles.levelText}>
              Level {user.currentLevel || 3} · {user.levelTitle || 'Scholar'}
            </Text>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, Math.max(10, user.currentExp || 65))}%` },
                ]}
              />
            </View>
            <Text style={styles.percentText}>{user.currentExp || 65}%</Text>
          </View>
        </View>

        {/* =========================================================
            3. HERO CARD: Hitung Mundur Ujian & Maskot Hamster
            ========================================================= */}
        <View style={styles.examHeroCard}>
          <View style={styles.examHeroLeft}>
            <Text style={styles.examTag}>Hitung mundur ujian</Text>
            <Text style={styles.examTitle}>
              {nearestExam
                ? `${nearestExam.title},\n${nearestExam.daysLeft} hari lagi`
                : 'PTS Matematika Wajib,\n3 hari lagi'}
            </Text>
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => onNavigateTab && onNavigateTab('Fokus')}
              activeOpacity={0.85}
            >
              <Text style={styles.reviewBtnText}>Review materi</Text>
            </TouchableOpacity>
          </View>

          <Image
            source={require('../../../assets/senang.png')}
            style={styles.heroMascotImg}
            resizeMode="contain"
          />
        </View>

        {/* =========================================================
            4. JADWAL HARI INI
            ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Jadwal hari ini</Text>
          <TouchableOpacity onPress={() => onNavigateTab && onNavigateTab('Jadwal')}>
            <Text style={styles.sectionDate}>Kamis, 30 Okt</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.whiteCardBox}>
          {/* Item 1: Fisika */}
          <TouchableOpacity
            style={styles.scheduleRow}
            onPress={() => onNavigateTab && onNavigateTab('Jadwal')}
            activeOpacity={0.7}
          >
            <View style={[styles.subjectIconBox, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.subjectInitial, { color: '#1D4ED8' }]}>F</Text>
            </View>
            <Text style={styles.subjectName}>Fisika</Text>
            <Text style={styles.subjectTime}>07:30</Text>
          </TouchableOpacity>

          {/* Item 2: Kimia */}
          <TouchableOpacity
            style={styles.scheduleRow}
            onPress={() => onNavigateTab && onNavigateTab('Jadwal')}
            activeOpacity={0.7}
          >
            <View style={[styles.subjectIconBox, { backgroundColor: '#FFE8D1' }]}>
              <Text style={[styles.subjectInitial, { color: '#9A3412' }]}>K</Text>
            </View>
            <Text style={styles.subjectName}>Kimia</Text>
            <Text style={styles.subjectTime}>09:00</Text>
          </TouchableOpacity>

          {/* Item 3: Bahasa Indonesia */}
          <TouchableOpacity
            style={[styles.scheduleRow, { borderBottomWidth: 0 }]}
            onPress={() => onNavigateTab && onNavigateTab('Jadwal')}
            activeOpacity={0.7}
          >
            <View style={[styles.subjectIconBox, { backgroundColor: '#E0F2F1' }]}>
              <Text style={[styles.subjectInitial, { color: '#115E59' }]}>B</Text>
            </View>
            <Text style={styles.subjectName}>Bahasa Indonesia</Text>
            <Text style={styles.subjectTime}>11:00</Text>
          </TouchableOpacity>
        </View>

        {/* =========================================================
            5. TUGAS PRIORITAS
            ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Tugas prioritas</Text>
          <Text style={styles.taskCountBadge}>{activeTasks.length || 2} tugas</Text>
        </View>

        <View style={styles.whiteCardBoxPadded}>
          {/* Task 1: Latihan Fisika GLBB */}
          <View style={styles.taskPriorityRow}>
            <View style={[styles.subjectIconBox, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.subjectInitial, { color: '#1D4ED8' }]}>F</Text>
            </View>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => {
                if (tasks.length > 0) setSelectedTask(tasks[0]);
              }}
            >
              <Text style={styles.taskTitleText}>Latihan Fisika GLBB</Text>
              <Text style={styles.taskDeadlineText}>Besok, 23:59</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cicilBtn}
              onPress={() => onNavigateTab && onNavigateTab('Fokus')}
              activeOpacity={0.85}
            >
              <Text style={styles.cicilBtnText}>Cicil</Text>
            </TouchableOpacity>
          </View>

          {/* Task 2: Rangkuman Sejarah Bab 4 */}
          <TouchableOpacity
            style={[styles.taskPriorityRow, { borderBottomWidth: 0, paddingBottom: 0 }]}
            onPress={() => {
              if (tasks.length > 1) setSelectedTask(tasks[1]);
              else if (tasks.length > 0) setSelectedTask(tasks[0]);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.subjectIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Text style={[styles.subjectInitial, { color: '#5B21B6' }]}>S</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitleText}>Rangkuman Sejarah Bab 4</Text>
              <Text style={styles.taskDeadlineText}>2 hari lagi</Text>
            </View>
            <ChevronRight color="#4A5670" size={18} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6FA', // Exact template background
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
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
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 112,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  examHeroLeft: {
    flex: 1,
  },
  examTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  examTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
    color: '#0F1B33',
  },
  reviewBtn: {
    marginTop: 10,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
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
  taskCountBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5670',
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
});
