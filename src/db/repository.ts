import { getDb } from './client';
import { Subject, Schedule, Task, Subtask, Exam, Note } from './schema';
import { TaskWithSubtasks } from '../features/tasks/taskSlice';
import { ScheduleWithSubject, ExamWithSubject } from '../features/schedule/scheduleSlice';
import { NoteWithSubject } from '../features/notes/noteSlice';

export class LocalDataRepository {
  /**
   * Load all subjects
   */
  static loadSubjects(): Subject[] {
    try {
      const db = getDb();
      return db.getAllSync<Subject>('SELECT * FROM subjects ORDER BY name ASC;');
    } catch (err) {
      console.warn('Failed to load subjects from SQLite:', err);
      return [];
    }
  }

  /**
   * Save subject
   */
  static saveSubject(subject: Subject): void {
    try {
      const db = getDb();
      db.runSync(
        `INSERT OR REPLACE INTO subjects (id, name, room, color, bg_color, initial)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          subject.id,
          subject.name,
          subject.room || '',
          subject.color || '#2563EB',
          subject.bgColor || '#DBEAFE',
          subject.initial || 'M',
        ]
      );
    } catch (err) {
      console.warn('Failed to save subject to SQLite:', err);
    }
  }

  /**
   * Delete subject
   */
  static deleteSubject(subjectId: number): void {
    try {
      const db = getDb();
      db.runSync('DELETE FROM subjects WHERE id = ?;', [subjectId]);
    } catch (err) {
      console.warn('Failed to delete subject from SQLite:', err);
    }
  }

  /**
   * Load all schedules with joined subject
   */
  static loadSchedules(): ScheduleWithSubject[] {
    try {
      const db = getDb();
      const rows = db.getAllSync<any>(`
        SELECT 
          s.id, s.subject_id as subjectId, s.day_of_week as dayOfWeek, s.start_time as startTime, s.end_time as endTime,
          sub.id as sub_id, sub.name as sub_name, sub.room as sub_room, sub.color as sub_color, sub.bg_color as sub_bgColor, sub.initial as sub_initial
        FROM schedules s
        LEFT JOIN subjects sub ON s.subject_id = sub.id
        ORDER BY s.start_time ASC;
      `);

      return rows.map((r) => ({
        id: r.id,
        subjectId: r.subjectId,
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        subject: {
          id: r.sub_id || r.subjectId,
          name: r.sub_name || 'Mata Pelajaran',
          room: r.sub_room || '',
          color: r.sub_color || '#2563EB',
          bgColor: r.sub_bgColor || '#DBEAFE',
          initial: r.sub_initial || 'M',
        },
      }));
    } catch (err) {
      console.warn('Failed to load schedules from SQLite:', err);
      return [];
    }
  }

  /**
   * Save schedule
   */
  static saveSchedule(schedule: ScheduleWithSubject): void {
    try {
      const db = getDb();
      db.runSync(
        `INSERT OR REPLACE INTO schedules (id, subject_id, day_of_week, start_time, end_time)
         VALUES (?, ?, ?, ?, ?);`,
        [
          schedule.id,
          schedule.subjectId,
          schedule.dayOfWeek,
          schedule.startTime,
          schedule.endTime,
        ]
      );
    } catch (err) {
      console.warn('Failed to save schedule to SQLite:', err);
    }
  }

  /**
   * Delete schedule
   */
  static deleteSchedule(scheduleId: number): void {
    try {
      const db = getDb();
      db.runSync('DELETE FROM schedules WHERE id = ?;', [scheduleId]);
    } catch (err) {
      console.warn('Failed to delete schedule from SQLite:', err);
    }
  }

  /**
   * Load all tasks with subtasks
   */
  static loadTasks(): TaskWithSubtasks[] {
    try {
      const db = getDb();
      const taskRows = db.getAllSync<any>(`
        SELECT 
          id, subject_id as subjectId, title, deadline_date as deadlineDate, priority, is_completed as isCompleted, created_at as createdAt
        FROM tasks
        ORDER BY id DESC;
      `);

      const subtaskRows = db.getAllSync<any>(`
        SELECT 
          id, task_id as taskId, title, is_completed as isCompleted, order_idx as orderIdx
        FROM subtasks
        ORDER BY order_idx ASC;
      `);

      return taskRows.map((t) => ({
        id: t.id,
        subjectId: t.subjectId,
        title: t.title,
        deadlineDate: t.deadlineDate,
        priority: t.priority,
        isCompleted: Boolean(t.isCompleted),
        createdAt: t.createdAt,
        subtasks: subtaskRows
          .filter((s) => s.taskId === t.id)
          .map((s) => ({
            id: s.id,
            taskId: s.taskId,
            title: s.title,
            isCompleted: Boolean(s.isCompleted),
            orderIdx: s.orderIdx,
          })),
      }));
    } catch (err) {
      console.warn('Failed to load tasks from SQLite:', err);
      return [];
    }
  }

  /**
   * Save task and sync its subtasks (removing deleted subtasks)
   */
  static saveTask(task: TaskWithSubtasks): void {
    try {
      const db = getDb();
      db.runSync(
        `INSERT OR REPLACE INTO tasks (id, subject_id, title, deadline_date, priority, is_completed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          task.id,
          task.subjectId || null,
          task.title,
          task.deadlineDate,
          task.priority,
          task.isCompleted ? 1 : 0,
          task.createdAt,
        ]
      );

      // Clean up orphaned subtasks removed from the task
      if (task.subtasks && task.subtasks.length > 0) {
        const subtaskIds = task.subtasks.map((s) => s.id).join(',');
        db.runSync(`DELETE FROM subtasks WHERE task_id = ? AND id NOT IN (${subtaskIds});`, [task.id]);

        // Upsert existing subtasks
        for (const sub of task.subtasks) {
          db.runSync(
            `INSERT OR REPLACE INTO subtasks (id, task_id, title, is_completed, order_idx)
             VALUES (?, ?, ?, ?, ?);`,
            [sub.id, task.id, sub.title, sub.isCompleted ? 1 : 0, sub.orderIdx]
          );
        }
      } else {
        db.runSync('DELETE FROM subtasks WHERE task_id = ?;', [task.id]);
      }
    } catch (err) {
      console.warn('Failed to save task to SQLite:', err);
    }
  }

  /**
   * Delete task and all its subtasks
   */
  static deleteTask(taskId: number): void {
    try {
      const db = getDb();
      db.runSync('DELETE FROM subtasks WHERE task_id = ?;', [taskId]);
      db.runSync('DELETE FROM tasks WHERE id = ?;', [taskId]);
    } catch (err) {
      console.warn('Failed to delete task from SQLite:', err);
    }
  }

  /**
   * Delete single subtask
   */
  static deleteSubtask(subtaskId: number): void {
    try {
      const db = getDb();
      db.runSync('DELETE FROM subtasks WHERE id = ?;', [subtaskId]);
    } catch (err) {
      console.warn('Failed to delete subtask from SQLite:', err);
    }
  }

  /**
   * Save or insert single subtask
   */
  static saveSubtask(subtask: Subtask): void {
    try {
      const db = getDb();
      db.runSync(
        `INSERT OR REPLACE INTO subtasks (id, task_id, title, is_completed, order_idx)
         VALUES (?, ?, ?, ?, ?);`,
        [subtask.id, subtask.taskId, subtask.title, subtask.isCompleted ? 1 : 0, subtask.orderIdx]
      );
    } catch (err) {
      console.warn('Failed to save subtask to SQLite:', err);
    }
  }

  /**
   * Update subtask completion status directly
   */
  static updateSubtaskCompletion(subtaskId: number, isCompleted: boolean): void {
    try {
      const db = getDb();
      db.runSync('UPDATE subtasks SET is_completed = ? WHERE id = ?;', [
        isCompleted ? 1 : 0,
        subtaskId,
      ]);
    } catch (err) {
      console.warn('Failed to update subtask completion in SQLite:', err);
    }
  }

  /**
   * Load all exams
   */
  static loadExams(): ExamWithSubject[] {
    try {
      const db = getDb();
      const rows = db.getAllSync<any>(`
        SELECT 
          e.id, e.subject_id as subjectId, e.title, e.exam_date as examDate,
          sub.id as sub_id, sub.name as sub_name, sub.color as sub_color
        FROM exams e
        LEFT JOIN subjects sub ON e.subject_id = sub.id
        ORDER BY e.exam_date ASC;
      `);

      return rows.map((r) => {
        const examDate = new Date(r.examDate);
        const today = new Date();
        const diffDays = Math.max(
          0,
          Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        );

        return {
          id: r.id,
          subjectId: r.subjectId,
          title: r.title,
          examDate: r.examDate,
          daysLeft: diffDays,
          subject: r.sub_id
            ? {
                id: r.sub_id,
                name: r.sub_name,
                room: '',
                color: r.sub_color || '#2563EB',
                bgColor: '#DBEAFE',
                initial: r.sub_name ? r.sub_name.charAt(0) : 'U',
              }
            : undefined,
        };
      });
    } catch (err) {
      console.warn('Failed to load exams from SQLite:', err);
      return [];
    }
  }

  /**
   * Save exam
   */
  static saveExam(exam: ExamWithSubject): void {
    try {
      const db = getDb();
      db.runSync(
        `INSERT OR REPLACE INTO exams (id, subject_id, title, exam_date)
         VALUES (?, ?, ?, ?);`,
        [exam.id, exam.subjectId || null, exam.title, exam.examDate]
      );
    } catch (err) {
      console.warn('Failed to save exam to SQLite:', err);
    }
  }

  /**
   * Delete exam
   */
  static deleteExam(examId: number): void {
    try {
      const db = getDb();
      db.runSync('DELETE FROM exams WHERE id = ?;', [examId]);
    } catch (err) {
      console.warn('Failed to delete exam from SQLite:', err);
    }
  }

  /**
   * Load all notes with joined subject
   */
  static loadNotes(): NoteWithSubject[] {
    try {
      const db = getDb();
      const rows = db.getAllSync<any>(`
        SELECT 
          n.id, n.subject_id as subjectId, n.date, n.content, n.created_at as createdAt,
          sub.id as sub_id, sub.name as sub_name, sub.color as sub_color, sub.bg_color as sub_bgColor, sub.initial as sub_initial
        FROM notes n
        LEFT JOIN subjects sub ON n.subject_id = sub.id
        ORDER BY n.id DESC;
      `);

      return rows.map((r) => ({
        id: r.id,
        subjectId: r.subjectId,
        date: r.date,
        content: r.content,
        createdAt: r.createdAt,
        subject: r.sub_id
          ? {
              id: r.sub_id,
              name: r.sub_name,
              room: '',
              color: r.sub_color || '#2563EB',
              bgColor: r.sub_bgColor || '#DBEAFE',
              initial: r.sub_initial || 'M',
            }
          : undefined,
      }));
    } catch (err) {
      console.warn('Failed to load notes from SQLite:', err);
      return [];
    }
  }

  /**
   * Save note
   */
  static saveNote(note: NoteWithSubject): void {
    try {
      const db = getDb();
      db.runSync(
        `INSERT OR REPLACE INTO notes (id, subject_id, date, content, created_at)
         VALUES (?, ?, ?, ?, ?);`,
        [note.id, note.subjectId, note.date, note.content, note.createdAt]
      );
    } catch (err) {
      console.warn('Failed to save note to SQLite:', err);
    }
  }

  /**
   * Delete note
   */
  static deleteNote(noteId: number): void {
    try {
      const db = getDb();
      db.runSync('DELETE FROM notes WHERE id = ?;', [noteId]);
    } catch (err) {
      console.warn('Failed to delete note from SQLite:', err);
    }
  }

  /**
   * Load user profile from SQLite
   */
  static loadUserProfile(): {
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
  } | null {
    try {
      const db = getDb();
      const row = db.getFirstSync<any>('SELECT * FROM user_profile WHERE id = 1;');
      if (!row) return null;
      return {
        name: row.name || '',
        school: row.school || '',
        grade: row.grade || '',
        currentLevel: row.current_level || 1,
        levelTitle: row.level_title || 'Pelajar Baru',
        currentExp: row.current_exp || 0,
        maxExp: row.max_exp || 100,
        streakDays: row.streak_days || 0,
        lastActiveDate: row.last_active_date || '',
        hasCompletedOnboarding: Boolean(row.has_completed_onboarding),
      };
    } catch (err) {
      console.warn('Failed to load user profile from SQLite:', err);
      return null;
    }
  }

  /**
   * Save user profile to SQLite
   */
  static saveUserProfile(profile: {
    name: string;
    school?: string;
    grade?: string;
    currentLevel?: number;
    levelTitle?: string;
    currentExp?: number;
    maxExp?: number;
    streakDays?: number;
    lastActiveDate?: string;
    hasCompletedOnboarding?: boolean;
  }): void {
    try {
      const db = getDb();
      db.runSync(
        `INSERT OR REPLACE INTO user_profile (
          id, name, school, grade, current_level, level_title, current_exp, max_exp, streak_days, last_active_date, has_completed_onboarding
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          profile.name,
          profile.school || '',
          profile.grade || '',
          profile.currentLevel ?? 1,
          profile.levelTitle || 'Pelajar Baru',
          profile.currentExp ?? 0,
          profile.maxExp ?? 100,
          profile.streakDays ?? 0,
          profile.lastActiveDate || '',
          profile.hasCompletedOnboarding ? 1 : 0,
        ]
      );
    } catch (err) {
      console.warn('Failed to save user profile to SQLite:', err);
    }
  }
}
