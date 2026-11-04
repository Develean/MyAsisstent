import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BookOpen, Plus } from 'lucide-react-native';
import { ScheduleWithSubject } from '../scheduleSlice';

export const getSubjectPalette = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('mate') || n.includes('fisi')) return { bg: '#DBEAFE', text: '#1D4ED8' };
  if (n.includes('bio') || n.includes('geo')) return { bg: '#E0F2F1', text: '#115E59' };
  if (n.includes('sej') || n.includes('ingg') || n.includes('sosio')) return { bg: '#EDE9FE', text: '#5B21B6' };
  if (n.includes('kimi') || n.includes('seni') || n.includes('eko')) return { bg: '#FEF3C7', text: '#D97706' };
  if (n.includes('indo') || n.includes('pjok') || n.includes('or')) return { bg: '#DCFCE7', text: '#15803D' };
  return { bg: '#DBEAFE', text: '#2563EB' };
};

interface ScheduleTimetableListProps {
  schedules: ScheduleWithSubject[];
  activeDayName: string;
  onSelectSchedule: (schedule: ScheduleWithSubject) => void;
  onOpenAddOptions: () => void;
}

export const ScheduleTimetableList: React.FC<ScheduleTimetableListProps> = ({
  schedules,
  activeDayName,
  onSelectSchedule,
  onOpenAddOptions,
}) => {
  return (
    <>
      <View style={styles.timetableContainer}>
        {schedules.length > 0 ? (
          schedules.map((sch, index) => {
            const isLast = index === schedules.length - 1;
            const palette = getSubjectPalette(sch.subject?.name || 'Mata Pelajaran');
            const initial =
              sch.subject?.initial || sch.subject?.name?.charAt(0)?.toUpperCase() || 'M';

            return (
              <TouchableOpacity
                key={sch.id}
                style={[styles.timetablerow, isLast && styles.timetablerowLast]}
                onPress={() => onSelectSchedule(sch)}
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
          <View style={styles.compactEmptyScheduleBox}>
            <View style={styles.emptyIconCircle}>
              <BookOpen size={20} color="#2563EB" />
            </View>
            <Text style={styles.emptyTitle}>
              Belum ada jadwal di hari {activeDayName}
            </Text>
            <Text style={styles.emptySubtitle}>
              Atur mata pelajaran untuk hari {activeDayName} agar jadwal kelasmu tertata rapi.
            </Text>
            <TouchableOpacity
              style={styles.emptyPrimaryCtaBtn}
              onPress={onOpenAddOptions}
              activeOpacity={0.85}
            >
              <Plus size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyPrimaryCtaBtnText}>Tambah Mapel atau Ujian</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* When schedules already exist, show secondary add button below the list */}
      {schedules.length > 0 && (
        <TouchableOpacity
          style={styles.addMapelUjianBtn}
          onPress={onOpenAddOptions}
          activeOpacity={0.85}
        >
          <Plus size={15} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={styles.addMapelUjianBtnText}>Tambah Mapel atau Ujian</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
  compactEmptyScheduleBox: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1B33',
    textAlign: 'center',
    marginBottom: 3,
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  emptyPrimaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyPrimaryCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  addMapelUjianBtn: {
    marginTop: 12,
    width: '100%',
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMapelUjianBtnText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 15,
  },
});
