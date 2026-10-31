import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FocusState {
  durationMinutes: number;
  remainingSeconds: number;
  isRunning: boolean;
  timerMode: 'pomodoro' | 'custom';
  activeTaskId: number | null;
  activeSubtaskId: number | null;
  completedSessions: number;
}

const initialState: FocusState = {
  durationMinutes: 25,
  remainingSeconds: 25 * 60,
  isRunning: false,
  timerMode: 'pomodoro',
  activeTaskId: null,
  activeSubtaskId: null,
  completedSessions: 0,
};

export const focusSlice = createSlice({
  name: 'focus',
  initialState,
  reducers: {
    setDuration: (state, action: PayloadAction<number>) => {
      state.durationMinutes = action.payload;
      state.remainingSeconds = action.payload * 60;
      state.isRunning = false;
    },
    setTimerMode: (state, action: PayloadAction<'pomodoro' | 'custom'>) => {
      state.timerMode = action.payload;
      state.isRunning = false;
    },
    setCustomDuration: (state, action: PayloadAction<number>) => {
      const mins = Math.max(1, Math.min(180, action.payload));
      state.durationMinutes = mins;
      state.remainingSeconds = mins * 60;
      state.timerMode = 'custom';
      state.isRunning = false;
    },
    tick: (state) => {
      if (state.remainingSeconds > 0 && state.isRunning) {
        state.remainingSeconds -= 1;
      } else if (state.remainingSeconds === 0 && state.isRunning) {
        state.isRunning = false;
        state.completedSessions += 1;
      }
    },
    togglePlayPause: (state) => {
      state.isRunning = !state.isRunning;
    },
    resetTimer: (state) => {
      state.isRunning = false;
      state.remainingSeconds = state.durationMinutes * 60;
    },
    setActiveTask: (
      state,
      action: PayloadAction<{ taskId: number; subtaskId?: number }>
    ) => {
      state.activeTaskId = action.payload.taskId;
      state.activeSubtaskId = action.payload.subtaskId || null;
    },
    clearActiveTask: (state) => {
      state.activeTaskId = null;
      state.activeSubtaskId = null;
    },
  },
});

export const {
  setDuration,
  setTimerMode,
  setCustomDuration,
  tick,
  togglePlayPause,
  resetTimer,
  setActiveTask,
  clearActiveTask,
} = focusSlice.actions;

export default focusSlice.reducer;
