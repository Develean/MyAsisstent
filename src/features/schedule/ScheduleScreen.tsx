import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { setSelectedDay, setSelectedDate, ScheduleWithSubject } from './scheduleSlice';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { AddExamModal } from './components/AddExamModal';
import { NotesModal } from '../notes/components/NotesModal';
import { MonthPickerModal, INDONESIAN_MONTHS } from './components/MonthPickerModal';
import { CalendarWeekStrip, CalendarDayItem } from './components/CalendarWeekStrip';
import { ScheduleTimetableList } from './components/ScheduleTimetableList';
import {
  Calendar,
  FileText,
  BookOpen,
  ChevronDown,
  Plus,
  Clock,
  RotateCcw,
} from 'lucide-react-native';

const INDONESIAN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
];

const INDONESIAN_DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const INDONESIAN_DAYS_FULL = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
];

const getNowTimeStr = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

interface ScheduleScreenProps {
  onOpenAddSubjectModal?: () => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ onOpenAddSubjectModal }) => {
  const dispatch = useAppDispatch();
  const schedules = useAppSelector((state) => state.schedule.schedules);
  const exams = useAppSelector((state) => state.schedule.exams);
  const notes = useAppSelector((state) => state.notes.notes);

  // Real-time current date initialization
  const initialDate = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<number>(initialDate.getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(initialDate.getMonth());
  const [selectedDateNum, setSelectedDateNum] = useState<number>(initialDate.getDate());
  const [currentTime, setCurrentTime] = useState<string>(getNowTimeStr());
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState<boolean>(false);

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWithSubject | null>(null);
  const [isExamModalVisible, setIsExamModalVisible] = useState(false);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);

  // Real-time clock tick (every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getNowTimeStr());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Sync real-time clock when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setCurrentTime(getNowTimeStr());
      }
    });
    return () => subscription.remove();
  }, []);

  // Initial mount synchronization with REAL-TIME current date
  useEffect(() => {
    const today = new Date();
    const dayName = INDONESIAN_DAYS_FULL[today.getDay()];
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    dispatch(setSelectedDay(dayName));
    dispatch(setSelectedDate(`${y}-${m}-${d}`));
  }, [dispatch]);

  // Check if selected date is TODAY in real-time
  const todayObj = new Date();
  const isTodaySelected =
    selectedYear === todayObj.getFullYear() &&
    selectedMonthIndex === todayObj.getMonth() &&
    selectedDateNum === todayObj.getDate();

  // Calculate days in the selected month
  const totalDaysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
  }, [selectedYear, selectedMonthIndex]);

  // Generate list of ALL days for the selected month with real-time isToday flag
  const monthDaysList = useMemo<CalendarDayItem[]>(() => {
    const list: CalendarDayItem[] = [];
    const now = new Date();
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonthIndex, d);
      const dayOfWeekIdx = dateObj.getDay();
      const dayName = INDONESIAN_DAYS_FULL[dayOfWeekIdx];
      const dayShort = INDONESIAN_DAYS_SHORT[dayOfWeekIdx];
      const fullDateStr = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasDot = exams.some((e) => e.examDate === fullDateStr);
      const isToday =
        d === now.getDate() &&
        selectedMonthIndex === now.getMonth() &&
        selectedYear === now.getFullYear();

      list.push({
        dateNum: d,
        dayShort,
        dayName,
        fullDateStr,
        hasDot,
        isToday,
      });
    }
    return list;
  }, [selectedYear, selectedMonthIndex, totalDaysInMonth, exams]);

  // Current active day item
  const currentActiveDayItem =
    monthDaysList.find((d) => d.dateNum === selectedDateNum) ||
    monthDaysList[0];

  const activeDayName = currentActiveDayItem.dayName;
  const dbSchedulesForDay = schedules.filter((s) => s.dayOfWeek === activeDayName);
  const notesForDay = notes.filter((n) => n.date === currentActiveDayItem.fullDateStr);
  const nearestExam = exams.length > 0 ? exams[0] : null;

  // Synchronize Redux selectedDay and selectedDate continuously
  useEffect(() => {
    dispatch(setSelectedDay(activeDayName));
    dispatch(setSelectedDate(currentActiveDayItem.fullDateStr));
  }, [activeDayName, currentActiveDayItem.fullDateStr, dispatch]);

  const handleOpenAddOptions = () => {
    Alert.alert(
      'Tambah Baru',
      'Pilih item yang ingin Anda tambahkan ke jadwal:',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Jadwal Mata Pelajaran',
          onPress: () => {
            if (onOpenAddSubjectModal) onOpenAddSubjectModal();
          },
        },
        {
          text: 'Jadwal Ujian / PTS / PAS',
          onPress: () => setIsExamModalVisible(true),
        },
        {
          text: 'Catatan Pelajaran',
          onPress: () => setIsNotesModalVisible(true),
        },
      ]
    );
  };

  const handleDaySelect = (dayItem: CalendarDayItem) => {
    setSelectedDateNum(dayItem.dateNum);
  };

  const handleSelectMonth = (monthIdx: number, year: number) => {
    setSelectedMonthIndex(monthIdx);
    setSelectedYear(year);

    const newTotalDays = new Date(year, monthIdx + 1, 0).getDate();
    const newDateNum = Math.min(selectedDateNum, newTotalDays);
    setSelectedDateNum(newDateNum);
    setIsMonthPickerVisible(false);
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonthIndex(now.getMonth());
    setSelectedDateNum(now.getDate());
    setIsMonthPickerVisible(false);
  };

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    24
  ) + 10;
  const bottomScrollPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12) + 80;

  return (
    <View style={[styles.safeArea, { paddingTop: topPadding }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomScrollPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TOP BAR: Title "Jadwal", Quick Today Button, & Clickable Month Button */}
        <View style={styles.topHeaderRow}>
          <View style={styles.titleWithLiveBadge}>
            <Text style={styles.screenTitle}>Jadwal</Text>
            {isTodaySelected && (
              <View style={styles.todayLiveIndicator}>
                <View style={styles.todayLiveDot} />
                <Text style={styles.todayLiveText}>HARI INI · {currentTime}</Text>
              </View>
            )}
          </View>

          <View style={styles.topRightControls}>
            {!isTodaySelected && (
              <TouchableOpacity
                style={styles.jumpTodayBtn}
                onPress={handleResetToCurrentMonth}
                activeOpacity={0.8}
              >
                <RotateCcw size={13} color="#2563EB" style={{ marginRight: 4 }} />
                <Text style={styles.jumpTodayText}>Hari Ini</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.calendarPillBtn}
              onPress={() => setIsMonthPickerVisible(true)}
              activeOpacity={0.8}
              accessibilityLabel="Atur Bulan dan Tahun"
            >
              <Calendar size={14} color="#0F1B33" style={{ marginRight: 6 }} />
              <Text style={styles.calendarPillText}>
                {INDONESIAN_MONTHS[selectedMonthIndex]} {selectedYear}
              </Text>
              <ChevronDown size={14} color="#0F1B33" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. CALENDAR WEEK STRIP COMPONENT */}
        <CalendarWeekStrip
          days={monthDaysList}
          selectedDateNum={selectedDateNum}
          onSelectDay={handleDaySelect}
          selectedMonthIndex={selectedMonthIndex}
          selectedYear={selectedYear}
        />

        {/* 3. EXAM ALERT CARD */}
        {nearestExam && (
          <TouchableOpacity
            style={styles.examAlertCard}
            onPress={() => setIsExamModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.examAlertLeft}>
              <Text style={styles.examAlertTag}>Ujian</Text>
              <Text style={styles.examAlertTitle}>
                {nearestExam.title}, {nearestExam.daysLeft} hari lagi
              </Text>
            </View>
            <Text style={styles.examAlertCountdown}>H-{nearestExam.daysLeft}</Text>
          </TouchableOpacity>
        )}

        {/* 4. SECTION HEADER: Date / Mapel Count */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionDateText}>
            {activeDayName}, {currentActiveDayItem.dateNum}{' '}
            {INDONESIAN_MONTHS_SHORT[selectedMonthIndex]}
            {isTodaySelected ? ' (Hari Ini)' : ''}
          </Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterBadgeText}>
              {dbSchedulesForDay.length} mapel
            </Text>
          </View>
        </View>

        {/* 5. MODULAR TIMETABLE LIST COMPONENT (With Live Status) */}
        <ScheduleTimetableList
          schedules={dbSchedulesForDay}
          activeDayName={activeDayName}
          isToday={isTodaySelected}
          currentTime={currentTime}
          onSelectSchedule={setSelectedSchedule}
          onOpenAddOptions={handleOpenAddOptions}
        />

        {/* 6. CATATAN & MATERI HARI INI */}
        <View style={styles.notesSectionHeader}>
          <Text style={styles.notesHeaderTitle}>
            Catatan {activeDayName}, {currentActiveDayItem.dateNum}{' '}
            {INDONESIAN_MONTHS_SHORT[selectedMonthIndex]}
          </Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterBadgeText}>{notesForDay.length} catatan</Text>
          </View>
        </View>

        {notesForDay.length > 0 ? (
          <View style={{ gap: 8, marginBottom: 16 }}>
            {notesForDay.map((note) => (
              <View key={note.id} style={styles.noteItemCard}>
                <View style={styles.noteItemHeader}>
                  <View style={styles.noteBadge}>
                    <BookOpen size={11} color="#2563EB" />
                    <Text style={styles.noteBadgeText}>{note.subject?.name || 'Umum'}</Text>
                  </View>
                </View>
                <Text style={styles.noteItemContent}>{note.content}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addMoreNotesBtn}
              onPress={() => setIsNotesModalVisible(true)}
              activeOpacity={0.85}
            >
              <Plus size={14} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.addMoreNotesBtnText}>Tambah Catatan Lainnya</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.compactEmptyNotesCard}>
            <View style={styles.emptyNotesIconCircle}>
              <FileText size={18} color="#2563EB" />
            </View>
            <Text style={styles.emptyNotesTitle}>Belum ada catatan materi</Text>
            <Text style={styles.emptyNotesSubtitle}>
              Tulis rangkuman penting, rumus, atau tugas materi untuk hari {activeDayName}.
            </Text>
            <TouchableOpacity
              style={styles.emptyNotesCtaBtn}
              onPress={() => setIsNotesModalVisible(true)}
              activeOpacity={0.85}
            >
              <Plus size={14} color="#2563EB" style={{ marginRight: 4 }} />
              <Text style={styles.emptyNotesCtaText}>Tulis Catatan Cepat</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modular Month & Year Picker Modal */}
      <MonthPickerModal
        visible={isMonthPickerVisible}
        selectedYear={selectedYear}
        selectedMonthIndex={selectedMonthIndex}
        onSelectMonth={handleSelectMonth}
        onResetToCurrentMonth={handleResetToCurrentMonth}
        onClose={() => setIsMonthPickerVisible(false)}
      />

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

      {/* Notes Modal */}
      <NotesModal
        visible={isNotesModalVisible}
        onClose={() => setIsNotesModalVisible(false)}
        defaultDate={currentActiveDayItem.fullDateStr}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  titleWithLiveBadge: {
    flexDirection: 'column',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F1B33',
    letterSpacing: -0.5,
  },
  todayLiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  todayLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  todayLiveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.3,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jumpTodayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  jumpTodayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  calendarPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3EAF4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  calendarPillText: {
    color: '#0F1B33',
    fontSize: 13,
    fontWeight: '700',
  },
  examAlertCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  examAlertLeft: {
    flex: 1,
  },
  examAlertTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  examAlertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F1B33',
    marginTop: 3,
  },
  examAlertCountdown: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
    marginLeft: 8,
  },
  sectionHeaderRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5670',
  },
  counterBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  notesSectionHeader: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5670',
  },
  noteItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  noteBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  noteItemContent: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
  addMoreNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#BFDBFE',
  },
  addMoreNotesBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  compactEmptyNotesCard: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyNotesIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyNotesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F1B33',
    textAlign: 'center',
    marginBottom: 2,
  },
  emptyNotesSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  emptyNotesCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  emptyNotesCtaText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
});
