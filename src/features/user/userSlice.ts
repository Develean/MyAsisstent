import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  name: string;
  school: string;
  grade: string;
  currentLevel: number;
  levelTitle: string;
  currentExp: number;
  maxExp: number;
  streakDays: number;
  hasCompletedOnboarding: boolean;
}

const initialState: UserState = {
  name: 'Develean',
  school: 'SMAN 1 Jakarta',
  grade: 'Kelas 11 MIPA 2',
  currentLevel: 3,
  levelTitle: 'Scholar',
  currentExp: 650,
  maxExp: 1000,
  streakDays: 4,
  hasCompletedOnboarding: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    completeOnboarding: (
      state,
      action: PayloadAction<{ name: string; school?: string; grade?: string }>
    ) => {
      state.name = action.payload.name.trim() || 'Teman Belajar';
      if (action.payload.school) state.school = action.payload.school;
      if (action.payload.grade) state.grade = action.payload.grade;
      state.hasCompletedOnboarding = true;
    },
    addExp: (state, action: PayloadAction<number>) => {
      state.currentExp += action.payload;
      while (state.currentExp >= state.maxExp) {
        state.currentExp -= state.maxExp;
        state.currentLevel += 1;
        state.maxExp = Math.round(state.maxExp * 1.3);
        if (state.currentLevel === 4) state.levelTitle = 'Master';
        if (state.currentLevel >= 5) state.levelTitle = 'Wisudawan';
      }
    },
    incrementStreak: (state) => {
      state.streakDays += 1;
    },
    resetOnboarding: (state) => {
      state.hasCompletedOnboarding = false;
    },
  },
});

export const { completeOnboarding, addExp, incrementStreak, resetOnboarding } = userSlice.actions;
export default userSlice.reducer;

