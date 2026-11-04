export interface Subject {
  id: number;
  name: string;
  room: string;
  color: string;
  bgColor: string;
  initial: string;
}

export interface Schedule {
  id: number;
  subjectId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface Task {
  id: number;
  subjectId: number | null;
  title: string;
  deadlineDate: string;
  priority: 'urgent' | 'normal' | 'low' | string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Subtask {
  id: number;
  taskId: number;
  title: string;
  isCompleted: boolean;
  orderIdx: number;
}

export interface Exam {
  id: number;
  subjectId: number | null;
  title: string;
  examDate: string;
}

export interface Note {
  id: number;
  subjectId: number | null;
  date: string;
  content: string;
  createdAt: string;
}
