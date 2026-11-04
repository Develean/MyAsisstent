import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Schedule, Subject, Exam } from '../../db/schema';

export interface ScheduleWithSubject extends Schedule {
  subject: Subject;
}

export interface ExamWithSubject extends Exam {
  subject?: Subject;
  daysLeft: number;
}

export interface ScheduleState {
  schedules: ScheduleWithSubject[];
  subjects: Subject[];
  exams: ExamWithSubject[];
  selectedDay: string;
  selectedDate: string;
}

const getInitialToday = () => {
  const now = new Date();
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDay = dayNames[now.getDay()];
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return {
    selectedDay: todayDay,
    selectedDate: `${y}-${m}-${d}`,
  };
};

const initialToday = getInitialToday();

const initialState: ScheduleState = {
  schedules: [],
  subjects: [],
  exams: [],
  selectedDay: initialToday.selectedDay,
  selectedDate: initialToday.selectedDate,
};

export const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setSchedules: (state, action: PayloadAction<ScheduleWithSubject[]>) => {
      state.schedules = action.payload;
    },
    setSubjects: (state, action: PayloadAction<Subject[]>) => {
      state.subjects = action.payload;
    },
    setExams: (state, action: PayloadAction<ExamWithSubject[]>) => {
      state.exams = action.payload;
    },
    setSelectedDay: (state, action: PayloadAction<string>) => {
      state.selectedDay = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    addSubject: (state, action: PayloadAction<Subject>) => {
      state.subjects.push(action.payload);
    },
    updateSubject: (state, action: PayloadAction<Subject>) => {
      const idx = state.subjects.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.subjects[idx] = action.payload;
        // update cached subject in schedules
        state.schedules.forEach((sch) => {
          if (sch.subjectId === action.payload.id) {
            sch.subject = action.payload;
          }
        });
      }
    },
    deleteSubject: (state, action: PayloadAction<number>) => {
      state.subjects = state.subjects.filter((s) => s.id !== action.payload);
      state.schedules = state.schedules.filter((sch) => sch.subjectId !== action.payload);
      state.exams = state.exams.filter((ex) => ex.subjectId !== action.payload);
    },
    addSchedule: (state, action: PayloadAction<ScheduleWithSubject>) => {
      state.schedules.push(action.payload);
      // sort schedules by startTime
      state.schedules.sort((a, b) => a.startTime.localeCompare(b.startTime));
    },
    deleteSchedule: (state, action: PayloadAction<number>) => {
      state.schedules = state.schedules.filter((s) => s.id !== action.payload);
    },
    addExam: (state, action: PayloadAction<ExamWithSubject>) => {
      state.exams.push(action.payload);
      // sort exams by daysLeft ascending
      state.exams.sort((a, b) => a.daysLeft - b.daysLeft);
    },
    deleteExam: (state, action: PayloadAction<number>) => {
      state.exams = state.exams.filter((e) => e.id !== action.payload);
    },
  },
});

export const {
  setSchedules,
  setSubjects,
  setExams,
  setSelectedDay,
  setSelectedDate,
  addSubject,
  updateSubject,
  deleteSubject,
  addSchedule,
  deleteSchedule,
  addExam,
  deleteExam,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
