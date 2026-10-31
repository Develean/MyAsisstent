import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let rawDb: SQLite.SQLiteDatabase | null = null;

export const getDb = () => {
  if (!dbInstance) {
    rawDb = SQLite.openDatabaseSync('myasisstent.db');
    dbInstance = drizzle(rawDb, { schema });
  }
  return dbInstance;
};

export const initDatabase = async () => {
  const db = SQLite.openDatabaseSync('myasisstent.db');

  // Execute Table Creations
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      room TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#2563EB',
      bg_color TEXT NOT NULL DEFAULT '#DBEAFE',
      initial TEXT NOT NULL DEFAULT 'M'
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      day_of_week TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL DEFAULT '09:00',
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      title TEXT NOT NULL,
      deadline_date TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      is_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      order_idx INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      title TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
    );
  `);

  console.log('[SQLite] Local database initialized successfully: myasisstent.db');
};

