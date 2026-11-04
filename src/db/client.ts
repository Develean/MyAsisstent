import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

export const DB_NAME = 'myasisten.db';
export const LEGACY_DB_NAME = 'myasisstent.db';

let sqliteDbInstance: SQLite.SQLiteDatabase | null = null;
let drizzleDbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Returns the unified singleton SQLite database instance.
 */
export const getRawDb = (): SQLite.SQLiteDatabase => {
  if (!sqliteDbInstance) {
    sqliteDbInstance = SQLite.openDatabaseSync(DB_NAME);
  }
  return sqliteDbInstance;
};

/**
 * Returns the unified Drizzle ORM instance wrapping the same SQLite handle.
 */
export const getDrizzleDb = () => {
  if (!drizzleDbInstance) {
    const raw = getRawDb();
    drizzleDbInstance = drizzle(raw, { schema });
  }
  return drizzleDbInstance;
};

// Default export alias
export const getDb = getRawDb;

/**
 * Initialize database tables and run migrations.
 */
export const initDatabase = async () => {
  const db = getRawDb();

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

    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      school TEXT NOT NULL DEFAULT '',
      grade TEXT NOT NULL DEFAULT '',
      current_level INTEGER NOT NULL DEFAULT 1,
      level_title TEXT NOT NULL DEFAULT 'Pelajar Baru',
      current_exp INTEGER NOT NULL DEFAULT 0,
      max_exp INTEGER NOT NULL DEFAULT 100,
      streak_days INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT NOT NULL DEFAULT '',
      has_completed_onboarding INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Migration: Ensure last_active_date column exists if table was created previously
  try {
    db.execSync(`ALTER TABLE user_profile ADD COLUMN last_active_date TEXT NOT NULL DEFAULT '';`);
  } catch {
    // Column already exists, safe to ignore
  }

  // Automatic Migration from Legacy DB name (myasisstent.db) if it exists
  try {
    const legacyCheck = db.getFirstSync<any>('SELECT COUNT(*) as count FROM user_profile;');
    if (!legacyCheck || legacyCheck.count === 0) {
      // Check if legacy database has data to copy over
      db.execSync(`
        ATTACH DATABASE '${LEGACY_DB_NAME}' AS old_db;
        INSERT OR IGNORE INTO user_profile SELECT id, name, school, grade, current_level, level_title, current_exp, max_exp, streak_days, '', has_completed_onboarding FROM old_db.user_profile;
        INSERT OR IGNORE INTO subjects SELECT * FROM old_db.subjects;
        INSERT OR IGNORE INTO schedules SELECT * FROM old_db.schedules;
        INSERT OR IGNORE INTO tasks SELECT * FROM old_db.tasks;
        INSERT OR IGNORE INTO subtasks SELECT * FROM old_db.subtasks;
        INSERT OR IGNORE INTO exams SELECT * FROM old_db.exams;
        INSERT OR IGNORE INTO notes SELECT * FROM old_db.notes;
        DETACH DATABASE old_db;
      `);
      console.log('[SQLite] Successfully migrated legacy data from myasisstent.db to myasisten.db');
    }
  } catch {
    // Legacy database didn't exist or already migrated
  }

  console.log(`[SQLite] Local database initialized successfully: ${DB_NAME}`);
};
