import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userReducer from '../features/user/userSlice';
import taskReducer from '../features/tasks/taskSlice';
import scheduleReducer from '../features/schedule/scheduleSlice';
import focusReducer from '../features/focus/focusSlice';
import noteReducer from '../features/notes/noteSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    tasks: taskReducer,
    schedule: scheduleReducer,
    focus: focusReducer,
    notes: noteReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

