import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, Subtask } from '../../db/schema';
import { autoGenerateSubtasks } from './subtaskEngine';
import { generateId } from '../../shared/utils/idGenerator';

export interface TaskWithSubtasks extends Task {
  subtasks: Subtask[];
}

export interface TaskState {
  tasks: TaskWithSubtasks[];
  filter: 'all' | 'pending' | 'completed' | 'urgent';
  isLoading: boolean;
}

const initialState: TaskState = {
  tasks: [],
  filter: 'all',
  isLoading: false,
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<TaskWithSubtasks[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<TaskWithSubtasks>) => {
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action: PayloadAction<TaskWithSubtasks>) => {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.tasks[idx] = action.payload;
      }
    },
    toggleTaskCompletion: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find((t) => t.id === action.payload);
      if (task) {
        task.isCompleted = !task.isCompleted;
        // toggle all subtasks to match
        task.subtasks.forEach((s) => {
          s.isCompleted = task.isCompleted;
        });
      }
    },
    toggleSubtaskCompletion: (
      state,
      action: PayloadAction<{ taskId: number; subtaskId: number }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        const sub = task.subtasks.find((s) => s.id === action.payload.subtaskId);
        if (sub) {
          sub.isCompleted = !sub.isCompleted;
          // check if all subtasks are done
          const allDone = task.subtasks.every((s) => s.isCompleted);
          task.isCompleted = allDone;
        }
      }
    },
    addSubtask: (
      state,
      action: PayloadAction<{ taskId: number; title: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task && action.payload.title.trim()) {
        const newSubtask: Subtask = {
          id: generateId(),
          taskId: task.id,
          title: action.payload.title.trim(),
          isCompleted: false,
          orderIdx: task.subtasks.length,
        };
        task.subtasks.push(newSubtask);
        task.isCompleted = false;
      }
    },
    deleteSubtask: (
      state,
      action: PayloadAction<{ taskId: number; subtaskId: number }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.subtasks = task.subtasks.filter((s) => s.id !== action.payload.subtaskId);
        if (task.subtasks.length > 0) {
          task.isCompleted = task.subtasks.every((s) => s.isCompleted);
        }
      }
    },
    autoBreakdownTask: (
      state,
      action: PayloadAction<{ taskId: number; subjectName?: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        const generated = autoGenerateSubtasks(task.title, action.payload.subjectName);
        task.subtasks = generated.map((g) => ({
          id: generateId(),
          taskId: task.id,
          title: g.title,
          isCompleted: false,
          orderIdx: g.orderIdx,
        }));
        task.isCompleted = false;
      }
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    setFilter: (state, action: PayloadAction<'all' | 'pending' | 'completed' | 'urgent'>) => {
      state.filter = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  toggleTaskCompletion,
  toggleSubtaskCompletion,
  addSubtask,
  deleteSubtask,
  autoBreakdownTask,
  deleteTask,
  setFilter,
} = taskSlice.actions;

export default taskSlice.reducer;
