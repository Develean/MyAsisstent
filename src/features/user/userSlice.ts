import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getDateOnlyString } from '../../shared/utils/dateUtils';

export interface UserState {
  name: string;
  school: string;
  grade: string;
  currentLevel: number;
  levelTitle: string;
  currentExp: number;
  maxExp: number;
  streakDays: number;
  lastActiveDate: string;
  hasCompletedOnboarding: boolean;
}

const initialState: UserState = {
  name: '',
  school: '',
  grade: '',
  currentLevel: 1,
  levelTitle: 'Pelajar Baru',
  currentExp: 0,
  maxExp: 100,
  streakDays: 0,
  lastActiveDate: '',
  hasCompletedOnboarding: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    updateProfile: (
      state,
      action: PayloadAction<{ name: string; school?: string; grade?: string }>
    ) => {
      state.name = action.payload.name.trim();
      if (action.payload.school !== undefined) state.school = action.payload.school.trim();
      if (action.payload.grade !== undefined) state.grade = action.payload.grade.trim();
    },
    completeOnboarding: (
      state,
      action: PayloadAction<{ name: string; school?: string; grade?: string }>
    ) => {
      state.name = action.payload.name.trim();
      state.school = action.payload.school ? action.payload.school.trim() : '';
      state.grade = action.payload.grade ? action.payload.grade.trim() : '';
      state.hasCompletedOnboarding = true;
    },
    addExp: (state, action: PayloadAction<number>) => {
      state.currentExp += action.payload;
      while (state.currentExp >= state.maxExp) {
        state.currentExp -= state.maxExp;
        state.currentLevel += 1;
        state.maxExp = Math.round(state.maxExp * 1.3);
        if (state.currentLevel === 2) state.levelTitle = 'Pelajar Rajin';
        else if (state.currentLevel === 3) state.levelTitle = 'Kutu Buku';
        else if (state.currentLevel === 4) state.levelTitle = 'Master Belajar';
        else if (state.currentLevel >= 5) state.levelTitle = 'Wisudawan';
      }
    },
    incrementStreak: (state) => {
      state.streakDays += 1;
    },
    recordDailyActivity: (state) => {
      const today = getDateOnlyString();
      if (!state.lastActiveDate) {
        state.streakDays = 1;
        state.lastActiveDate = today;
      } else if (state.lastActiveDate === today) {
        // Already active today, streak intact
        return;
      } else {
        const [y1, m1, d1] = state.lastActiveDate.split('-').map(Number);
        const [y2, m2, d2] = today.split('-').map(Number);
        const prevUTC = Date.UTC(y1, m1 - 1, d1);
        const todayUTC = Date.UTC(y2, m2 - 1, d2);
        const diffDays = Math.round((todayUTC - prevUTC) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          state.streakDays += 1;
        } else if (diffDays > 1) {
          state.streakDays = 1;
        }
        state.lastActiveDate = today;
      }
    },
    resetOnboarding: (state) => {
      state.hasCompletedOnboarding = false;
    },
  },
});

export const {
  setUserProfile,
  updateProfile,
  completeOnboarding,
  addExp,
  incrementStreak,
  recordDailyActivity,
  resetOnboarding,
} = userSlice.actions;
export default userSlice.reducer;

