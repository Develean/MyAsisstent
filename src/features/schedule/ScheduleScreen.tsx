import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { setSelectedDay, ScheduleWithSubject } from './scheduleSlice';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { AddExamModal } from './components/AddExamModal';
import {
  Plus,
  BookOpen,
  Clock,
  MapPin,
  AlertCircle,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

interface ScheduleScreenProps {
  onOpenAddSubjectModal?: () => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ onOpenAddSubjectModal }) => {
  const dispatch = useAppDispatch();
  const selectedDay = useAppSelector((state) => state.schedule.selectedDay);
  const schedules = useAppSelector((state) => state.schedule.schedules);
  const exams = useAppSelector((state) => state.schedule.exams);
  const tasks = useAppSelector((state) => state.tasks.tasks);

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWithSubject | null>(null);
  const [isExamModalVisible, setIsExamModalVisible] = useState(false);

  // Filter schedules for the selected day
  const currentDaySchedules = schedules.filter((s) => s.dayOfWeek === selectedDay);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Jadwal Pelajaran</Text>
          <Text style={styles.subtitle}>Atur jadwal kelas & pantau ujian mingguanmu</Text>
        </View>
        <View style={styles.headerBtnRow}>
          <TouchableOpacity
            style={styles.addExamButton}
            onPress={() => setIsExamModalVisible(true)}
          >
            <AlertCircle color="#DC2626" size={15} />
            <Text style={styles.addExamButtonText}>+ Ujian</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={onOpenAddSubjectModal}>
            <Plus color="#FFFFFF" size={17} strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Mapel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Selector Pills */}
      <View style={styles.daySelectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelector}
        >
          {DAYS.map((day) => {
            const isActive = selectedDay === day;
            const count = schedules.filter((s) => s.dayOfWeek === day).length;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayPill, isActive && styles.dayPillActive]}
                onPress={() => dispatch(setSelectedDay(day))}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day}</Text>
                {count > 0 && (
                  <View style={[styles.dayCountDot, isActive && styles.dayCountDotActive]}>
                    <Text style={[styles.dayCountText, isActive && styles.dayCountTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exam Countdown Banner */}
        {exams.length > 0 && (
          <View style={styles.examBanner}>
            <View style={styles.examBannerHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={16} color="#B91C1C" />
                <Text style={styles.examBannerTitle}>Ujian & Penilaian Mendatang</Text>
              </View>
              <TouchableOpacity onPress={() => setIsExamModalVisible(true)}>
                <Text style={styles.examBannerAction}>+ Tambah</Text>
              </TouchableOpacity>
            </View>
            {exams.map((exam) => (
              <View key={exam.id} style={styles.examItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.examSubject}>
                    {exam.subject?.name || 'Mata Pelajaran'}
                  </Text>
                  <Text style={styles.examDesc}>
                    {exam.title} · {exam.examDate}
                  </Text>
                </View>
                <View
                  style={[
                    styles.examBadge,
                    { backgroundColor: exam.daysLeft <= 3 ? '#DC2626' : '#EA580C' },
                  ]}
                >
                  <Text style={styles.examBadgeText}>H-{exam.daysLeft}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Schedule List for Selected Day */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mata Pelajaran ({selectedDay})</Text>
          <Text style={styles.sectionCount}>{currentDaySchedules.length} Mapel</Text>
        </View>

        {currentDaySchedules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <BookOpen size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Mapel di Hari {selectedDay}</Text>
            <Text style={styles.emptySubtitle}>
              Tap tombol (+ Mapel) di kanan atas atau tombol (+) di tengah bawah untuk menambahkan mata pelajaran!
            </Text>
          </View>
        ) : (
          <View style={styles.scheduleCardList}>
            {currentDaySchedules.map((schedule) => {
              const activeTasksCount = tasks.filter(
                (t) =>
                  !t.isCompleted &&
                  (t.subjectId === schedule.subjectId ||
                    t.title.toLowerCase().includes(schedule.subject.name.toLowerCase()))
              ).length;

              return (
                <TouchableOpacity
                  key={schedule.id}
                  style={styles.scheduleCard}
                  activeOpacity={0.85}
                  onPress={() => setSelectedSchedule(schedule)}
                >
                  <View
                    style={[
                      styles.colorStrip,
                      { backgroundColor: schedule.subject?.color || '#2563EB' },
                    ]}
                  />
                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.subjectName}>{schedule.subject?.name}</Text>
                      <ChevronRight size={16} color="#94A3B8" />
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Clock size={12} color="#64748B" />
                        <Text style={styles.metaText}>
                          {schedule.startTime} - {schedule.endTime}
                        </Text>
                      </View>
                      {schedule.subject?.room ? (
                        <View style={styles.metaItem}>
                          <MapPin size={12} color="#64748B" />
                          <Text style={styles.metaText}>{schedule.subject.room}</Text>
                        </View>
                      ) : null}
                    </View>

                    {activeTasksCount > 0 && (
                      <View style={styles.activeTaskBadge}>
                        <Sparkles size={11} color="#2563EB" />
                        <Text style={styles.activeTaskBadgeText}>
                          {activeTasksCount} tugas belum selesai
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Subject Detail Modal */}
        <SubjectDetailModal
          schedule={selectedSchedule}
          visible={!!selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
        />

        {/* Add Exam Modal */}
        <AddExamModal
          visible={isExamModalVisible}
          onClose={() => setIsExamModalVisible(false)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
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
  headerBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addExamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
  },
  addExamButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  daySelectorWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  daySelector: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  dayPillActive: {
    backgroundColor: '#2563EB',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  dayCountDot: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  dayCountDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dayCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  dayCountTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 18,
    paddingBottom: 90,
  },
  examBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  examBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  examBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  examBannerAction: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  examSubject: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7F1D1D',
  },
  examDesc: {
    fontSize: 11,
    color: '#991B1B',
    marginTop: 1,
  },
  examBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  examBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F1B33',
  },
  sectionCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  scheduleCardList: {
    gap: 10,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  colorStrip: {
    width: 6,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F1B33',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginTop: 8,
  },
  activeTaskBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});
