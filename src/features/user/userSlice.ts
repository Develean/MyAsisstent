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
  name: '',
  school: '',
  grade: '',
  currentLevel: 1,
  levelTitle: 'Pelajar Baru',
  currentExp: 0,
  maxExp: 100,
  streakDays: 0,
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

export const {
  setUserProfile,
  updateProfile,
  completeOnboarding,
  addExp,
  incrementStreak,
  resetOnboarding,
} = userSlice.actions;
export default userSlice.reducer;

