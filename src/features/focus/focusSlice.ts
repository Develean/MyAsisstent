import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FocusState {
  durationMinutes: number;
  remainingSeconds: number;
  isRunning: boolean;
  timerMode: 'pomodoro' | 'custom';
  activeTaskId: number | null;
  activeSubtaskId: number | null;
  completedSessions: number;
  targetEndTime: number | null;
}

const initialState: FocusState = {
  durationMinutes: 25,
  remainingSeconds: 25 * 60,
  isRunning: false,
  timerMode: 'pomodoro',
  activeTaskId: null,
  activeSubtaskId: null,
  completedSessions: 0,
  targetEndTime: null,
};

export const focusSlice = createSlice({
  name: 'focus',
  initialState,
  reducers: {
    setDuration: (state, action: PayloadAction<number>) => {
      state.durationMinutes = action.payload;
      state.remainingSeconds = action.payload * 60;
      state.isRunning = false;
      state.targetEndTime = null;
    },
    setTimerMode: (state, action: PayloadAction<'pomodoro' | 'custom'>) => {
      state.timerMode = action.payload;
      state.isRunning = false;
      state.targetEndTime = null;
    },
    setCustomDuration: (state, action: PayloadAction<number>) => {
      const mins = Math.max(1, Math.min(180, action.payload));
      state.durationMinutes = mins;
      state.remainingSeconds = mins * 60;
      state.timerMode = 'custom';
      state.isRunning = false;
      state.targetEndTime = null;
    },
    tick: (state) => {
      if (!state.isRunning) return;
      if (state.targetEndTime) {
        const remaining = Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));
        state.remainingSeconds = remaining;
        if (remaining === 0) {
          state.isRunning = false;
          state.targetEndTime = null;
          state.completedSessions += 1;
        }
      } else {
        if (state.remainingSeconds > 0) {
          state.remainingSeconds -= 1;
        } else {
          state.isRunning = false;
          state.completedSessions += 1;
        }
      }
    },
    togglePlayPause: (state) => {
      if (!state.isRunning) {
        if (state.remainingSeconds <= 0) {
          state.remainingSeconds = state.durationMinutes * 60;
        }
        state.isRunning = true;
        state.targetEndTime = Date.now() + state.remainingSeconds * 1000;
      } else {
        state.isRunning = false;
        state.targetEndTime = null;
      }
    },
    syncFromBackground: (state) => {
      if (state.isRunning && state.targetEndTime) {
        const remaining = Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));
        state.remainingSeconds = remaining;
        if (remaining === 0) {
          state.isRunning = false;
          state.targetEndTime = null;
          state.completedSessions += 1;
        }
      }
    },
    stopTimer: (state) => {
      state.isRunning = false;
      state.targetEndTime = null;
    },
    resetTimer: (state) => {
      state.isRunning = false;
      state.targetEndTime = null;
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
  syncFromBackground,
  stopTimer,
  resetTimer,
  setActiveTask,
  clearActiveTask,
} = focusSlice.actions;

export default focusSlice.reducer;
