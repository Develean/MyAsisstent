import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/store';
import {
  TaskWithSubtasks,
  toggleTaskCompletion,
  setFilter,
} from '../tasks/taskSlice';
import { addExp } from '../user/userSlice';
import { TaskDetailModal } from '../tasks/components/TaskDetailModal';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  Clock,
  Plus,
  Sparkles,
  BookOpen,
  CheckSquare,
  Play,
} from 'lucide-react-native';

interface HomeScreenProps {
  onOpenAddModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenAddModal, onNavigateTab }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const filter = useAppSelector((state) => state.tasks.filter);
  const schedules = useAppSelector((state) => state.schedule.schedules);

  const [selectedTask, setSelectedTask] = useState<TaskWithSubtasks | null>(null);

  // Determine today's name in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = dayNames[new Date().getDay()];

  // Active (uncompleted) tasks
  const activeTasks = tasks.filter((t) => !t.isCompleted);

  // Filtered tasks based on active filter tab
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    if (filter === 'urgent') return t.priority === 'urgent' && !t.isCompleted;
    return true; // 'all'
  });

  const handleToggleTask = (task: TaskWithSubtasks) => {
    const willComplete = !task.isCompleted;
    dispatch(toggleTaskCompletion(task.id));
    if (willComplete) {
      dispatch(addExp(20)); // +20 EXP for completing a task!
    }
  };

  // Mascot dynamic mood based on workload
  const getMascotMood = () => {
    if (activeTasks.length === 0) {
      return {
        image: require('../../../assets/senang.png'),
        badge: 'Santai & Rileks',
        badgeColor: '#10B981',
        bgColor: '#ECFDF5',
        speech: `Semua tugasmu beres, ${user.name || 'Teman Belajar'}! Hebat banget, nikmati waktu santaimu ya! 🌟`,
      };
    }
    const hasUrgent = activeTasks.some((t) => {
      if (!t.deadlineDate) return false;
      const diff = new Date(t.deadlineDate).getTime() - Date.now();
      return diff <= 24 * 3600 * 1000 && diff > 0;
    });

    if (hasUrgent) {
      return {
        image: require('../../../assets/semangat.png'),
        badge: 'Deadline Dekat (H-1)',
        badgeColor: '#EF4444',
        bgColor: '#FEF2F2',
        speech: `Ada tugas yang deadline-nya segera lho! Yuk cicil 1 sesi fokus sekarang biar ga panik! 🔥`,
      };
    }

    return {
      image: require('../../../assets/fokus.png'),
      badge: 'Mode Belajar Aktif',
      badgeColor: '#2563EB',
      bgColor: '#EFF6FF',
      speech: `Ada ${activeTasks.length} tugas yang perlu kamu cicil hari ini. Satu langkah demi satu langkah ya! 🚀`,
    };
  };

  const mascotMood = getMascotMood();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingSub}>Halo, Selamat Belajar!</Text>
            <Text style={styles.userName}>{user.name || 'Teman Belajar'}</Text>
            {user.grade ? (
              <Text style={styles.userClass}>{user.school ? `${user.school} · ` : ''}{user.grade}</Text>
            ) : null}
          </View>
          <View style={styles.streakBadge}>
            <Flame color="#F97316" size={18} fill="#F97316" />
            <Text style={styles.streakText}>{user.streakDays} Hari</Text>
          </View>
        </View>

        {/* Mascot Status & Speech Card */}
        <View style={[styles.mascotCard, { backgroundColor: mascotMood.bgColor }]}>
          <Image source={mascotMood.image} style={styles.mascotImage} resizeMode="contain" />
          <View style={styles.mascotTextContainer}>
            <View style={[styles.moodBadge, { backgroundColor: mascotMood.badgeColor + '20' }]}>
              <Sparkles size={12} color={mascotMood.badgeColor} />
              <Text style={[styles.moodBadgeText, { color: mascotMood.badgeColor }]}>
                {mascotMood.badge}
              </Text>
            </View>
            <Text style={styles.mascotSpeechText}>{mascotMood.speech}</Text>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeTasks.length}</Text>
            <Text style={styles.statLabel}>Tugas Aktif</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>Lv. {user.currentLevel}</Text>
            <Text style={styles.statLabel}>{user.levelTitle}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user.currentExp} XP</Text>
            <Text style={styles.statLabel}>Total EXP</Text>
          </View>
        </View>

        {/* Today's Schedule Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Jadwal Hari Ini ({todayName})</Text>
          </View>
          <TouchableOpacity onPress={() => onNavigateTab && onNavigateTab('Jadwal')}>
            <Text style={styles.sectionAction}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {schedules.length === 0 ? (
          <View style={styles.emptyCard}>
            <BookOpen size={30} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Belum Ada Jadwal Pelajaran</Text>
            <Text style={styles.emptyDesc}>
              Tap tombol (+) di bawah untuk memasukkan mata pelajaran pertamamu!
            </Text>
          </View>
        ) : (
          <View style={styles.scheduleList}>
            {schedules.slice(0, 3).map((item, idx) => (
              <View key={idx} style={styles.scheduleItem}>
                <View style={[styles.scheduleColorBar, { backgroundColor: item.subject?.color || '#2563EB' }]} />
                <View style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12 }}>
                  <Text style={styles.scheduleSubject}>{item.subject?.name || 'Mata Pelajaran'}</Text>
                  <Text style={styles.scheduleTime}>
                    {item.startTime} - {item.endTime} {item.subject?.room ? `· ${item.subject.room}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Task Management & Subtasks Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <CheckCircle2 size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Daftar Tugas & Subtask</Text>
          </View>
          <TouchableOpacity onPress={onOpenAddModal}>
            <Text style={styles.sectionAction}>+ Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* Task Filter Pills */}
        <View style={styles.filterPillsRow}>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'pending', label: 'Belum Selesai' },
            { id: 'urgent', label: 'Penting 🔥' },
            { id: 'completed', label: 'Selesai' },
          ].map((item) => {
            const isActive = filter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => dispatch(setFilter(item.id as any))}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Sparkles size={32} color="#10B981" />
            <Text style={styles.emptyTitle}>
              {filter === 'completed'
                ? 'Belum ada tugas yang diselesaikan'
                : 'Tidak ada tugas pada filter ini'}
            </Text>
            <Text style={styles.emptyDesc}>
              Tap tombol (+) di bawah untuk membuat tugas baru dan memecahnya menjadi langkah mini!
            </Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {filteredTasks.map((task) => {
              const subCount = task.subtasks.length;
              const subDone = task.subtasks.filter((s) => s.isCompleted).length;
              const progress = subCount > 0 ? Math.round((subDone / subCount) * 100) : task.isCompleted ? 100 : 0;

              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  activeOpacity={0.8}
                  onPress={() => setSelectedTask(task)}
                >
                  <TouchableOpacity
                    style={styles.taskCheckTouch}
                    onPress={() => handleToggleTask(task)}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 size={22} color="#10B981" />
                    ) : (
                      <Circle size={22} color="#CBD5E1" />
                    )}
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.isCompleted && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>

                    <View style={styles.taskMetaRow}>
                      {task.deadlineDate ? (
                        <View style={styles.taskDeadlineContainer}>
                          <Clock size={11} color="#EF4444" />
                          <Text style={styles.taskDeadlineText}>{task.deadlineDate}</Text>
                        </View>
                      ) : null}

                      {subCount > 0 ? (
                        <View style={styles.subtaskBadge}>
                          <CheckSquare size={11} color="#2563EB" />
                          <Text style={styles.subtaskBadgeText}>
                            {subDone}/{subCount} subtask ({progress}%)
                          </Text>
                        </View>
                      ) : (
                        <View style={[styles.subtaskBadge, { backgroundColor: '#F1F5F9' }]}>
                          <Sparkles size={11} color="#64748B" />
                          <Text style={[styles.subtaskBadgeText, { color: '#64748B' }]}>
                            Tap untuk pecah subtask
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Mini Progress Bar if has subtasks */}
                    {subCount > 0 && (
                      <View style={styles.miniProgressTrack}>
                        <View
                          style={[
                            styles.miniProgressFill,
                            {
                              width: `${progress}%`,
                              backgroundColor: task.isCompleted ? '#10B981' : '#2563EB',
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.priorityPill,
                      { backgroundColor: task.priority === 'urgent' ? '#FEE2E2' : '#F1F5F9' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: task.priority === 'urgent' ? '#EF4444' : '#64748B' },
                      ]}
                    >
                      {task.priority === 'urgent' ? 'Penting' : 'Normal'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          visible={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onStartFocus={() => {
            if (onNavigateTab) onNavigateTab('Fokus');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 90,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1B33',
    letterSpacing: -0.3,
  },
  userClass: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
  },
  mascotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mascotImage: {
    width: 68,
    height: 68,
  },
  mascotTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    marginBottom: 4,
  },
  moodBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mascotSpeechText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1B33',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1B33',
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  scheduleList: {
    gap: 8,
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scheduleColorBar: {
    width: 6,
  },
  scheduleSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1B33',
  },
  scheduleTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  taskList: {
    gap: 10,
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  taskCheckTouch: {
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1B33',
    lineHeight: 18,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  taskDeadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDeadlineText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  subtaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  subtaskBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  miniProgressTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
