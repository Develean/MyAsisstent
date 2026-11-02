import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { setSelectedDay, setSelectedDate, ScheduleWithSubject } from './scheduleSlice';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { AddExamModal } from './components/AddExamModal';
import {
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Plus,
} from 'lucide-react-native';
import { ActionFeedbackToast, ToastType } from '../../shared/components/ActionFeedbackToast';

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const INDONESIAN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agt',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const INDONESIAN_DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const INDONESIAN_DAYS_FULL = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

interface CalendarDayItem {
  dateNum: number;
  dayShort: string;
  dayName: string;
  fullDateStr: string;
  hasDot: boolean;
}

const getSubjectPalette = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('mate') || n.includes('fisi')) return { bg: '#DBEAFE', text: '#1D4ED8' };
  if (n.includes('bio') || n.includes('geo')) return { bg: '#E0F2F1', text: '#115E59' };
  if (n.includes('sej') || n.includes('ingg') || n.includes('sosio')) return { bg: '#EDE9FE', text: '#5B21B6' };
  if (n.includes('kimi') || n.includes('seni') || n.includes('eko')) return { bg: '#FEF3C7', text: '#D97706' };
  if (n.includes('indo') || n.includes('pjok') || n.includes('or')) return { bg: '#DCFCE7', text: '#15803D' };
  return { bg: '#DBEAFE', text: '#2563EB' };
};

interface ScheduleScreenProps {
  onOpenAddSubjectModal?: () => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ onOpenAddSubjectModal }) => {
  const dispatch = useAppDispatch();
  const selectedDay = useAppSelector((state) => state.schedule.selectedDay);
  const schedules = useAppSelector((state) => state.schedule.schedules);
  const exams = useAppSelector((state) => state.schedule.exams);

  // Month & Year State (Defaults to Oktober 2026 as master mockup)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(9); // 0-indexed: 9 = Oktober
  const [selectedDateNum, setSelectedDateNum] = useState<number>(30); // 30 Okt (Jumat)
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState<boolean>(false);
  const [pickerTempYear, setPickerTempYear] = useState<number>(2026);

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWithSubject | null>(null);
  const [isExamModalVisible, setIsExamModalVisible] = useState(false);

  const stripScrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  // Calculate days in the selected month
  const totalDaysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
  }, [selectedYear, selectedMonthIndex]);

  // Generate list of ALL days for the selected month
  const monthDaysList = useMemo<CalendarDayItem[]>(() => {
    const list: CalendarDayItem[] = [];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonthIndex, d);
      const dayOfWeekIdx = dateObj.getDay();
      const dayName = INDONESIAN_DAYS_FULL[dayOfWeekIdx];
      const dayShort = INDONESIAN_DAYS_SHORT[dayOfWeekIdx];
      const fullDateStr = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Check if this date has exams scheduled
      const hasExamOnDate = exams.some(
        (e) => e.examDate === fullDateStr
      );

      // Has dot indicator: only if an exam exists on this date
      const hasDot = hasExamOnDate;

      list.push({
        dateNum: d,
        dayShort,
        dayName,
        fullDateStr,
        hasDot,
      });
    }
    return list;
  }, [selectedYear, selectedMonthIndex, totalDaysInMonth, exams]);

  // Auto scroll to active date when dateNum or month changes
  useEffect(() => {
    if (stripScrollViewRef.current) {
      // Each day card has width 52px + 8px gap = 60px
      const targetX = Math.max(0, (selectedDateNum - 1) * 60 - 100);
      const timer = setTimeout(() => {
        stripScrollViewRef.current?.scrollTo({ x: targetX, animated: true });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [selectedDateNum, selectedMonthIndex, selectedYear]);

  // Current active day item
  const currentActiveDayItem =
    monthDaysList.find((d) => d.dateNum === selectedDateNum) ||
    monthDaysList[0];

  // Real DB schedules for the selected day
  const dbSchedulesForDay = schedules.filter((s) => s.dayOfWeek === selectedDay);

  // Nearest exam
  const nearestExam = exams.length > 0 ? exams[0] : null;

  const handleOpenAddOptions = () => {
    Alert.alert(
      'Tambah Baru',
      'Pilih item yang ingin Anda tambahkan ke jadwal:',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Jadwal Mata Pelajaran',
          onPress: () => {
            if (onOpenAddSubjectModal) {
              onOpenAddSubjectModal();
            }
          },
        },
        {
          text: 'Jadwal Ujian / PTS / PAS',
          onPress: () => setIsExamModalVisible(true),
        },
      ]
    );
  };

  const handleDaySelect = (dayItem: CalendarDayItem) => {
    setSelectedDateNum(dayItem.dateNum);
    dispatch(setSelectedDay(dayItem.dayName));
    dispatch(setSelectedDate(dayItem.fullDateStr));
  };

  const handleOpenMonthPicker = () => {
    setPickerTempYear(selectedYear);
    setIsMonthPickerVisible(true);
  };

  const handleSelectMonth = (monthIdx: number) => {
    setSelectedMonthIndex(monthIdx);
    setSelectedYear(pickerTempYear);

    // Adjust selectedDateNum if exceeds days in new month
    const newTotalDays = new Date(pickerTempYear, monthIdx + 1, 0).getDate();
    const newDateNum = Math.min(selectedDateNum, newTotalDays);
    setSelectedDateNum(newDateNum);

    // Compute new day of week
    const dateObj = new Date(pickerTempYear, monthIdx, newDateNum);
    const dayName = INDONESIAN_DAYS_FULL[dateObj.getDay()];
    const fullDateStr = `${pickerTempYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(newDateNum).padStart(2, '0')}`;

    dispatch(setSelectedDay(dayName));
    dispatch(setSelectedDate(fullDateStr));

    setIsMonthPickerVisible(false);
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();
    const nowDate = now.getDate();

    setSelectedYear(nowYear);
    setSelectedMonthIndex(nowMonth);
    setSelectedDateNum(nowDate);

    const dayName = INDONESIAN_DAYS_FULL[now.getDay()];
    const fullDateStr = `${nowYear}-${String(nowMonth + 1).padStart(2, '0')}-${String(nowDate).padStart(2, '0')}`;

    dispatch(setSelectedDay(dayName));
    dispatch(setSelectedDate(fullDateStr));

    setIsMonthPickerVisible(false);
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================
            1. TOP BAR: Title "Jadwal" & Clickable Month Button
            ========================================================= */}
        <View style={styles.topHeaderRow}>
          <Text style={styles.screenTitle}>Jadwal</Text>
          <TouchableOpacity
            style={styles.calendarPillBtn}
            onPress={handleOpenMonthPicker}
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

        {/* =========================================================
            2. ALL DAYS OF MONTH SELECTOR STRIP (Scrollable 1..31)
            ========================================================= */}
        <View style={styles.weekStripWrapper}>
          <ScrollView
            ref={stripScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekStripScrollContent}
          >
            {monthDaysList.map((dayItem) => {
              const isActive = selectedDateNum === dayItem.dateNum;
              return (
                <TouchableOpacity
                  key={dayItem.dateNum}
                  style={[styles.stripCard, isActive && styles.stripCardActive]}
                  onPress={() => handleDaySelect(dayItem)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.stripDayName, isActive && styles.stripDayNameActive]}>
                    {dayItem.dayShort}
                  </Text>
                  <Text style={[styles.stripDateNum, isActive && styles.stripDateNumActive]}>
                    {dayItem.dateNum}
                  </Text>
                  {isActive ? (
                    <View style={styles.activeWhiteDot} />
                  ) : dayItem.hasDot ? (
                    <View style={styles.amberDot} />
                  ) : (
                    <View style={styles.dotPlaceholder} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* =========================================================
            3. EXAM ALERT CARD: Tampil jika ada ujian yang dijadwalkan
            ========================================================= */}
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

        {/* =========================================================
            4. SECTION HEADER: Date / Mapel Count
            ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionDateText}>
            {currentActiveDayItem.dayName}, {currentActiveDayItem.dateNum}{' '}
            {INDONESIAN_MONTHS_SHORT[selectedMonthIndex]}
          </Text>
          <Text style={styles.sectionCountText}>
            {dbSchedulesForDay.length} mapel
          </Text>
        </View>

        {/* =========================================================
            5. SUBJECTS LIST CONTAINER (Single White Box with Dividers)
            ========================================================= */}
        <View style={styles.timetableContainer}>
          {dbSchedulesForDay.length > 0 ? (
            dbSchedulesForDay.map((sch, index) => {
              const isLast = index === dbSchedulesForDay.length - 1;
              const palette = getSubjectPalette(sch.subject?.name || 'Mata Pelajaran');
              const initial = sch.subject?.initial || sch.subject?.name?.charAt(0)?.toUpperCase() || 'M';

              return (
                <TouchableOpacity
                  key={sch.id}
                  style={[styles.timetablerow, isLast && styles.timetablerowLast]}
                  onPress={() => setSelectedSchedule(sch)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.subjectInitialBox, { backgroundColor: palette.bg }]}>
                    <Text style={[styles.subjectInitialText, { color: palette.text }]}>
                      {initial}
                    </Text>
                  </View>

                  <View style={styles.subjectMiddleBox}>
                    <Text style={styles.subjectNameText} numberOfLines={1}>
                      {sch.subject?.name || 'Mata Pelajaran'}
                    </Text>
                    <Text style={styles.subjectRoomText} numberOfLines={1}>
                      {sch.subject?.room || 'Ruang Kelas'}
                    </Text>
                  </View>

                  <Text style={styles.subjectTimeText}>{sch.startTime}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.actionableEmptyCard}>
              <View style={styles.emptyIconCircle}>
                <BookOpen size={24} color="#2563EB" />
              </View>
              <Text style={styles.emptyTitle}>Belum ada jadwal di hari {selectedDay}</Text>
              <Text style={styles.emptySubtitle}>
                Atur mata pelajaran untuk hari {selectedDay} agar jadwal kelasmu tertata rapi.
              </Text>
              <TouchableOpacity
                style={styles.emptyCtaButton}
                onPress={() => onOpenAddSubjectModal && onOpenAddSubjectModal()}
                activeOpacity={0.85}
              >
                <Plus size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyCtaText}>Tambah Mapel Hari {selectedDay}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* =========================================================
            6. ADD BUTTON: + Tambah mapel atau ujian
            ========================================================= */}
        <TouchableOpacity
          style={styles.addMapelUjianBtn}
          onPress={handleOpenAddOptions}
          activeOpacity={0.85}
        >
          <Text style={styles.addMapelUjianBtnText}>+ Tambah mapel atau ujian</Text>
        </TouchableOpacity>

        {/* =========================================================
            7. CATATAN & MATERI HARI INI
            ========================================================= */}
        <View style={styles.notesSectionHeader}>
          <Text style={styles.notesHeaderTitle}>
            Catatan {currentActiveDayItem.dayName}, {currentActiveDayItem.dateNum}{' '}
            {INDONESIAN_MONTHS_SHORT[selectedMonthIndex]}
          </Text>
          <View style={styles.notesCountBadge}>
            <Text style={styles.notesCountText}>0 catatan</Text>
          </View>
        </View>

        <View style={styles.actionableEmptyNotesCard}>
          <View style={styles.emptyNotesIconCircle}>
            <FileText size={20} color="#2563EB" />
          </View>
          <Text style={styles.emptyNotesTitle}>Belum ada catatan materi</Text>
          <Text style={styles.emptyNotesSubtitle}>
            Tulis rangkuman penting, rumus, atau tugas materi untuk hari {selectedDay}.
          </Text>
          <TouchableOpacity
            style={styles.emptyNotesCtaBtn}
            onPress={handleOpenAddOptions}
            activeOpacity={0.85}
          >
            <Plus size={14} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.emptyNotesCtaText}>Tulis Catatan Cepat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* =========================================================
          MONTH & YEAR PICKER MODAL
          ========================================================= */}
      <Modal
        visible={isMonthPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMonthPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsMonthPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.monthPickerCard}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.yearControlBox}>
                <TouchableOpacity
                  style={styles.yearArrowBtn}
                  onPress={() => setPickerTempYear((prev) => prev - 1)}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={20} color="#0F1B33" />
                </TouchableOpacity>

                <Text style={styles.pickerYearText}>{pickerTempYear}</Text>

                <TouchableOpacity
                  style={styles.yearArrowBtn}
                  onPress={() => setPickerTempYear((prev) => prev + 1)}
                  activeOpacity={0.7}
                >
                  <ChevronRight size={20} color="#0F1B33" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsMonthPickerVisible(false)}
                activeOpacity={0.7}
              >
                <X size={18} color="#4A5670" />
              </TouchableOpacity>
            </View>

            <Text style={styles.pickerInstructionText}>
              Pilih bulan untuk melihat seluruh tanggal jadwal pelajaran:
            </Text>

            {/* Months 3x4 Grid */}
            <View style={styles.monthsGrid}>
              {INDONESIAN_MONTHS.map((monthName, idx) => {
                const isSelected =
                  idx === selectedMonthIndex && pickerTempYear === selectedYear;
                return (
                  <TouchableOpacity
                    key={monthName}
                    style={[
                      styles.monthGridItem,
                      isSelected && styles.monthGridItemActive,
                    ]}
                    onPress={() => handleSelectMonth(idx)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.monthGridItemText,
                        isSelected && styles.monthGridItemTextActive,
                      ]}
                    >
                      {monthName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Reset to Today Button */}
            <TouchableOpacity
              style={styles.resetToTodayBtn}
              onPress={handleResetToCurrentMonth}
              activeOpacity={0.8}
            >
              <RotateCcw size={15} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.resetToTodayBtnText}>Kembali ke Hari Ini</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F1B33',
    letterSpacing: -0.5,
  },
  calendarPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3EAF4',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  calendarPillText: {
    color: '#0F1B33',
    fontSize: 13,
    fontWeight: '700',
  },
  weekStripWrapper: {
    marginTop: 16,
    marginHorizontal: -20, // stretch to screen edges for smooth scrolling
  },
  weekStripScrollContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
  },
  stripCard: {
    width: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stripCardActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  stripDayName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5670',
  },
  stripDayNameActive: {
    color: '#FFFFFF',
    opacity: 0.95,
  },
  stripDateNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1B33',
    marginTop: 2,
  },
  stripDateNumActive: {
    color: '#FFFFFF',
  },
  activeWhiteDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  amberDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F59E0B',
    marginTop: 4,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
    marginTop: 4,
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
  sectionCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5670',
  },
  timetableContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  timetablerow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 62,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  timetablerowLast: {
    borderBottomWidth: 0,
  },
  subjectInitialBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectInitialText: {
    fontWeight: '800',
    fontSize: 16,
  },
  subjectMiddleBox: {
    flex: 1,
  },
  subjectNameText: {
    fontWeight: '800',
    fontSize: 15,
    color: '#0F1B33',
  },
  subjectRoomText: {
    fontSize: 12,
    color: '#4A5670',
    fontWeight: '600',
    marginTop: 1,
  },
  subjectTimeText: {
    fontSize: 13,
    color: '#4A5670',
    fontWeight: '600',
  },
  emptyTimetableBox: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTimetableText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  addMapelUjianBtn: {
    marginTop: 16,
    width: '100%',
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E3EAF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMapelUjianBtnText: {
    color: '#0F1B33',
    fontWeight: '700',
    fontSize: 15,
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
  notesCountBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  notesCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  notesListWrapper: {
    marginTop: 10,
    gap: 10,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  noteSubjectInitial: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteInitialText: {
    fontWeight: '800',
    fontSize: 12,
  },
  noteSubjectInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteSubjectTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5670',
  },
  noteTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  noteTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1B33',
    marginBottom: 4,
  },
  noteSnippetText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  emptyNotesCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },
  emptyNotesText: {
    fontSize: 13,
    color: '#94A3B8',
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
    marginVertical: 4,
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
    paddingHorizontal: 10,
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
  actionableEmptyNotesCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },
  emptyNotesIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  emptyNotesCtaText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 27, 51, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  monthPickerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F1B33',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  yearControlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yearArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerYearText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1B33',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerInstructionText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  monthGridItem: {
    width: '31%',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  monthGridItemActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  monthGridItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1B33',
  },
  monthGridItemTextActive: {
    color: '#FFFFFF',
  },
  resetToTodayBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  resetToTodayBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
});
