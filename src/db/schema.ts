import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const subjects = sqliteTable('subjects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  room: text('room').notNull().default(''),
  color: text('color').notNull().default('#2563EB'),
  bgColor: text('bg_color').notNull().default('#DBEAFE'),
  initial: text('initial').notNull().default('M'),
});

export const schedules = sqliteTable('schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subjectId: integer('subject_id').notNull().references(() => subjects.id),
  dayOfWeek: text('day_of_week').notNull(), // 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  startTime: text('start_time').notNull(),  // '07:30'
  endTime: text('end_time').notNull().default('09:00'),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subjectId: integer('subject_id').references(() => subjects.id),
  title: text('title').notNull(),
  deadlineDate: text('deadline_date').notNull(), // '2026-10-31'
  priority: text('priority').notNull().default('normal'), // 'urgent', 'normal', 'low'
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export const subtasks = sqliteTable('subtasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').notNull().references(() => tasks.id),
  title: text('title').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  orderIdx: integer('order_idx').notNull().default(0),
});

export const exams = sqliteTable('exams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subjectId: integer('subject_id').references(() => subjects.id),
  title: text('title').notNull(),
  examDate: text('exam_date').notNull(), // '2026-11-04'
});

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subjectId: integer('subject_id').references(() => subjects.id),
  date: text('date').notNull(), // '2026-10-28'
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

export type Subject = typeof subjects.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Subtask = typeof subtasks.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type Note = typeof notes.$inferSelect;

