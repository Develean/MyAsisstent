import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { setSelectedDay, ScheduleWithSubject } from './scheduleSlice';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { AddExamModal } from './components/AddExamModal';
import {
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react-native';

interface DayStripItem {
  id: string;
  dayShort: string;
  dayName: string;
  dateNum: number;
  hasDot?: boolean;
}

const WEEK_DAYS: DayStripItem[] = [
  { id: 'sen', dayShort: 'Sen', dayName: 'Senin', dateNum: 26 },
  { id: 'sel', dayShort: 'Sel', dayName: 'Selasa', dateNum: 27 },
  { id: 'rab', dayShort: 'Rab', dayName: 'Rabu', dateNum: 28, hasDot: true },
  { id: 'kam', dayShort: 'Kam', dayName: 'Kamis', dateNum: 29 },
  { id: 'jum', dayShort: 'Jum', dayName: 'Jumat', dateNum: 30, hasDot: true },
  { id: 'sab', dayShort: 'Sab', dayName: 'Sabtu', dateNum: 31 },
];

const DEFAULT_SCHEDULES_BY_DAY: Record<
  string,
  Array<{
    id: number;
    name: string;
    room: string;
    startTime: string;
    endTime: string;
    initial: string;
    bg: string;
    textColor: string;
  }>
> = {
  Jumat: [
    { id: 101, name: 'Matematika', room: 'Ruang 11A', startTime: '07:30', endTime: '09:00', initial: 'M', bg: '#DBEAFE', textColor: '#1D4ED8' },
    { id: 102, name: 'Biologi', room: 'Lab IPA', startTime: '09:00', endTime: '10:30', initial: 'B', bg: '#E0F2F1', textColor: '#115E59' },
    { id: 103, name: 'Sejarah', room: 'Ruang 11A', startTime: '11:00', endTime: '12:30', initial: 'S', bg: '#EDE9FE', textColor: '#5B21B6' },
  ],
  Kamis: [
    { id: 201, name: 'Fisika', room: 'Lab Fisika', startTime: '07:30', endTime: '09:00', initial: 'F', bg: '#DBEAFE', textColor: '#1D4ED8' },
    { id: 202, name: 'Kimia', room: 'Lab Kimia', startTime: '09:00', endTime: '10:30', initial: 'K', bg: '#FEF3C7', textColor: '#D97706' },
    { id: 203, name: 'Bahasa Indonesia', room: 'Ruang 11A', startTime: '11:00', endTime: '12:30', initial: 'B', bg: '#DCFCE7', textColor: '#15803D' },
  ],
  Senin: [
    { id: 301, name: 'Upacara Bendera', room: 'Lapangan Utama', startTime: '07:00', endTime: '08:00', initial: 'U', bg: '#FEE2E2', textColor: '#DC2626' },
    { id: 302, name: 'Matematika Wajib', room: 'Ruang 11A', startTime: '08:00', endTime: '10:00', initial: 'M', bg: '#DBEAFE', textColor: '#1D4ED8' },
    { id: 303, name: 'Bahasa Inggris', room: 'Lab Bahasa', startTime: '10:15', endTime: '11:45', initial: 'E', bg: '#EDE9FE', textColor: '#5B21B6' },
  ],
  Selasa: [
    { id: 401, name: 'PJOK Olahraga', room: 'Gelanggang Olahraga', startTime: '07:30', endTime: '09:30', initial: 'P', bg: '#DCFCE7', textColor: '#15803D' },
    { id: 402, name: 'Seni Budaya', room: 'Ruang Kesenian', startTime: '09:45', endTime: '11:15', initial: 'S', bg: '#FEF3C7', textColor: '#D97706' },
    { id: 403, name: 'Geografi', room: 'Ruang 11A', startTime: '11:15', endTime: '12:45', initial: 'G', bg: '#E0F2F1', textColor: '#115E59' },
  ],
  Rabu: [
    { id: 501, name: 'Sosiologi', room: 'Ruang 11A', startTime: '07:30', endTime: '09:00', initial: 'S', bg: '#EDE9FE', textColor: '#5B21B6' },
    { id: 502, name: 'Ekonomi Akuntansi', room: 'Ruang 11A', startTime: '09:00', endTime: '10:30', initial: 'E', bg: '#FEF3C7', textColor: '#D97706' },
    { id: 503, name: 'PPKN', room: 'Ruang 11A', startTime: '11:00', endTime: '12:30', initial: 'P', bg: '#FEE2E2', textColor: '#DC2626' },
  ],
  Sabtu: [
    { id: 601, name: 'Ekstrakurikuler Robotik', room: 'Lab Komputer', startTime: '08:00', endTime: '10:00', initial: 'R', bg: '#DBEAFE', textColor: '#1D4ED8' },
    { id: 602, name: 'Pramuka Wajib', room: 'Aula Utama', startTime: '10:00', endTime: '12:00', initial: 'P', bg: '#FEF3C7', textColor: '#D97706' },
  ],
};

const NOTES_BY_DAY: Record<
  string,
  Array<{
    id: number;
    subject: string;
    title: string;
    content: string;
    time: string;
    initial: string;
    bg: string;
    textColor: string;
  }>
> = {
  Jumat: [
    {
      id: 1,
      subject: 'Biologi',
      title: 'Kisi-kisi Metabolisme & Enzim',
      content: 'Hafalkan cara kerja enzim kunci gembok & siklus glikolisis (halaman 54-62).',
      time: '09:45',
      initial: 'B',
      bg: '#E0F2F1',
      textColor: '#115E59',
    },
    {
      id: 2,
      subject: 'Matematika',
      title: 'Rumus Cepat Limit Fungsi Aljabar',
      content: 'Catatan turunan bentuk tak tentu 0/0 menggunakan metode L’Hopital.',
      time: '08:15',
      initial: 'M',
      bg: '#DBEAFE',
      textColor: '#1D4ED8',
    },
  ],
  Kamis: [
    {
      id: 3,
      subject: 'Fisika',
      title: 'Rumus GLBB Dipercepat & Diperlambat',
      content: 'vt = v0 + at, s = v0 t + 1/2 a t^2, vt^2 = v0^2 + 2as.',
      time: '08:30',
      initial: 'F',
      bg: '#DBEAFE',
      textColor: '#1D4ED8',
    },
    {
      id: 4,
      subject: 'Kimia',
      title: 'Struktur Tata Nama Alkana',
      content: 'Rantai utama terpanjang, penomoran cabang dari ujung terdekat.',
      time: '10:15',
      initial: 'K',
      bg: '#FEF3C7',
      textColor: '#D97706',
    },
  ],
  Senin: [
    {
      id: 5,
      subject: 'Matematika Wajib',
      title: 'Matriks & Transformasi Geometri',
      content: 'Perkalian matriks ordo 2x2 dan determinan ad - bc.',
      time: '09:10',
      initial: 'M',
      bg: '#DBEAFE',
      textColor: '#1D4ED8',
    },
  ],
  Selasa: [
    {
      id: 6,
      subject: 'Geografi',
      title: 'Peta Topografi & Kontur Interval',
      content: 'Rumus CI = 1/2000 x penyebut skala.',
      time: '11:45',
      initial: 'G',
      bg: '#E0F2F1',
      textColor: '#115E59',
    },
  ],
  Rabu: [
    {
      id: 7,
      subject: 'Sosiologi',
      title: 'Bentuk Perubahan Sosial Budaya',
      content: 'Evolusi vs revolusi, perubahan terencana vs tidak terencana.',
      time: '08:40',
      initial: 'S',
      bg: '#EDE9FE',
      textColor: '#5B21B6',
    },
  ],
  Sabtu: [
    {
      id: 8,
      subject: 'Robotik',
      title: 'Pemrograman Sensor Ultrasonik HC-SR04',
      content: 'Koneksi pin Trigger & Echo ke mikrokontroler Arduino Uno.',
      time: '09:30',
      initial: 'R',
      bg: '#DBEAFE',
      textColor: '#1D4ED8',
    },
  ],
};

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

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWithSubject | null>(null);
  const [isExamModalVisible, setIsExamModalVisible] = useState(false);

  // Active strip item
  const currentStripDay = WEEK_DAYS.find((d) => d.dayName === selectedDay) || WEEK_DAYS[4]; // Default Jumat

  // Real DB schedules for the selected day
  const dbSchedulesForDay = schedules.filter((s) => s.dayOfWeek === selectedDay);

  // Fallback master design items if user hasn't added custom schedules yet
  const fallbackList = DEFAULT_SCHEDULES_BY_DAY[selectedDay] || [];

  // Nearest exam
  const nearestExam = exams.length > 0 ? exams[0] : null;

  // Notes for this day
  const notesForDay = NOTES_BY_DAY[selectedDay] || [];

  const handleOpenAddOptions = () => {
    Alert.alert(
      'Tambah Baru',
      'Pilih item yang ingin Anda tambahkan ke jadwal:',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: '📅 Jadwal Mata Pelajaran',
          onPress: () => {
            if (onOpenAddSubjectModal) {
              onOpenAddSubjectModal();
            }
          },
        },
        {
          text: '🚨 Jadwal Ujian / PTS / PAS',
          onPress: () => setIsExamModalVisible(true),
        },
      ]
    );
  };

  const handleDaySelect = (dayItem: DayStripItem) => {
    dispatch(setSelectedDay(dayItem.dayName));
  };

  const handleOpenAcademicCalendar = () => {
    Alert.alert(
      'Kalender Akademik',
      'Semester Ganjil 2026/2027\n\n• PTS Semester: 2 - 7 November 2026\n• Remedial & Pengayaan: 10 - 15 November 2026\n• PAS Akhir Semester: 1 - 12 Desember 2026',
      [{ text: 'Tutup', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================
            1. TOP BAR: Title "Jadwal" & Pill "Oktober 2026"
            ========================================================= */}
        <View style={styles.topHeaderRow}>
          <Text style={styles.screenTitle}>Jadwal</Text>
          <TouchableOpacity
            style={styles.calendarPillBtn}
            onPress={handleOpenAcademicCalendar}
            activeOpacity={0.8}
          >
            <Text style={styles.calendarPillText}>Oktober 2026</Text>
          </TouchableOpacity>
        </View>

        {/* =========================================================
            2. WEEKLY DAY SELECTOR STRIP (Sen 26 s/d Sab 31)
            ========================================================= */}
        <View style={styles.weekStripRow}>
          {WEEK_DAYS.map((dayItem) => {
            const isActive = selectedDay === dayItem.dayName;
            return (
              <TouchableOpacity
                key={dayItem.id}
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
        </View>

        {/* =========================================================
            3. EXAM ALERT CARD: PTS Biologi, 5 hari lagi | H-5
            ========================================================= */}
        <TouchableOpacity
          style={styles.examAlertCard}
          onPress={() => setIsExamModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.examAlertLeft}>
            <Text style={styles.examAlertTag}>Ujian</Text>
            <Text style={styles.examAlertTitle}>
              {nearestExam
                ? `${nearestExam.title}, ${nearestExam.daysLeft} hari lagi`
                : 'PTS Biologi, 5 hari lagi'}
            </Text>
          </View>
          <Text style={styles.examAlertCountdown}>
            {nearestExam ? `H-${nearestExam.daysLeft}` : 'H-5'}
          </Text>
        </TouchableOpacity>

        {/* =========================================================
            4. SECTION HEADER: Date / Mapel Count
            ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionDateText}>
            {selectedDay}, {currentStripDay.dateNum} Okt
          </Text>
          <Text style={styles.sectionCountText}>
            {dbSchedulesForDay.length > 0
              ? `${dbSchedulesForDay.length} mapel`
              : `${fallbackList.length} mapel`}
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
          ) : fallbackList.length > 0 ? (
            fallbackList.map((item, index) => {
              const isLast = index === fallbackList.length - 1;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.timetablerow, isLast && styles.timetablerowLast]}
                  onPress={() => {
                    // Create mock schedule object for modal
                    setSelectedSchedule({
                      id: item.id,
                      subjectId: item.id,
                      dayOfWeek: selectedDay,
                      startTime: item.startTime,
                      endTime: item.endTime,
                      subject: {
                        id: item.id,
                        name: item.name,
                        room: item.room,
                        color: item.textColor,
                        bgColor: item.bg,
                        initial: item.initial,
                      },
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.subjectInitialBox, { backgroundColor: item.bg }]}>
                    <Text style={[styles.subjectInitialText, { color: item.textColor }]}>
                      {item.initial}
                    </Text>
                  </View>

                  <View style={styles.subjectMiddleBox}>
                    <Text style={styles.subjectNameText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.subjectRoomText} numberOfLines={1}>
                      {item.room}
                    </Text>
                  </View>

                  <Text style={styles.subjectTimeText}>{item.startTime}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyTimetableBox}>
              <BookOpen size={28} color="#94A3B8" />
              <Text style={styles.emptyTimetableText}>
                Tidak ada jadwal pelajaran di hari {selectedDay}
              </Text>
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
            Catatan {selectedDay}, {currentStripDay.dateNum} Okt
          </Text>
          <View style={styles.notesCountBadge}>
            <Text style={styles.notesCountText}>{notesForDay.length} catatan</Text>
          </View>
        </View>

        <View style={styles.notesListWrapper}>
          {notesForDay.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={styles.noteCard}
              onPress={() =>
                Alert.alert(
                  note.title,
                  `${note.subject} · ${note.time}\n\n${note.content}`
                )
              }
              activeOpacity={0.8}
            >
              <View style={styles.noteCardHeader}>
                <View style={[styles.noteSubjectInitial, { backgroundColor: note.bg }]}>
                  <Text style={[styles.noteInitialText, { color: note.textColor }]}>
                    {note.initial}
                  </Text>
                </View>
                <View style={styles.noteSubjectInfo}>
                  <Text style={styles.noteSubjectTitle}>{note.subject}</Text>
                  <Text style={styles.noteTime}>{note.time}</Text>
                </View>
              </View>

              <Text style={styles.noteTitleText}>{note.title}</Text>
              <Text style={styles.noteSnippetText} numberOfLines={2}>
                {note.content}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6FA',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0,
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
    backgroundColor: '#E3EAF4',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
  },
  calendarPillText: {
    color: '#0F1B33',
    fontSize: 13,
    fontWeight: '700',
  },
  weekStripRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  stripCard: {
    flex: 1,
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
});
