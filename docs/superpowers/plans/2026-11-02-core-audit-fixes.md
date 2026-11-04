# Core Audit & Architectural Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 12 architectural defects, persistence bugs, timer flaws, and tech-debt items identified in the codebase audit to achieve production-grade stability, offline data integrity, and clean code standards.

**Architecture:** 
- Unified single-instance SQLite persistence layer with atomic repository methods.
- Wall-clock timestamp timer with `AppState` background recovery and local notification triggers.
- Monotonic unique ID generation and strict ISO 8601 date schema.
- Modularized component architecture for FocusScreen (< 200 lines orchestrator).
- Zero NativeWind v2 baggage in favor of unified React Native StyleSheet design system.

**Tech Stack:** React Native 0.88, Expo SDK 58, TypeScript, Redux Toolkit, expo-sqlite, expo-notifications, Lucide Icons.

---

## Global Constraints
- Preserve school terminology (`Mapel`, `Jadwal Pelajaran`, `Profil Siswa`).
- Keep safe area insets on all screens (`useSafeAreaInsets()`).
- Zero emoji icons in UI elements (use vector Lucide icons only).
- Zero data loss: automatically migrate existing database data if database file name is renamed.

---

## Review Focus
1. **Background Timer Accuracy:** Minimizing app for 15 minutes must accurately deduct 15 minutes from the timer when resumed.
2. **Subtask Deletion Persistence:** Deleting a subtask must immediately remove it from SQLite; restarting Metro must not bring it back.
3. **Database Single Instance:** Repository and Client must share the exact same SQLite database handle without stale data or SQLite busy locks.
4. **Deadline ISO Formatting:** `deadlineDate` must be valid ISO 8601 string; notifications and display helpers must parse without NaN.
5. **Streak Progression:** Completing focus session or task on consecutive days must increment streak; skipping > 1 day must reset to 1.

---

### Task 1: Database Architecture & Name Typo Fix (Issues #2, #8, #10)

**Files:**
- Create/Modify: `src/db/client.ts`
- Modify: `src/db/repository.ts`
- Modify: `package.json`
- Modify: `app.json`

- [ ] **Step 1:** Consolidate `src/db/client.ts` to export a single unified SQLite database singleton (`getDb()` / `rawDb`). Handle automatic data migration from `myasisstent.db` to `myasisten.db` if the old database exists.
- [ ] **Step 2:** Refactor `src/db/repository.ts` to import `getDb` directly from `src/db/client.ts` instead of calling `SQLite.openDatabaseSync('myasisstent.db')` on every query.
- [ ] **Step 3:** Correct project typos in `package.json` (`"name": "myasisten"`) and `app.json` (`"name": "MyAsisten"`, `"slug": "myasisten"`, `"package": "com.develean.myasisten"`).
- [ ] **Step 4:** Address Drizzle integration: Ensure `src/db/schema.ts` tables and `client.ts` cleanly unify with typed queries and repository helpers.
- [ ] **Step 5:** Run TypeScript check to verify clean database compilation.

---

### Task 2: Monotonic ID Generation & ISO Date Standardization (Issues #1, #3)

**Files:**
- Create: `src/shared/utils/idGenerator.ts`
- Create: `src/shared/utils/dateUtils.ts`
- Modify: `src/shared/components/QuickAddModal.tsx`
- Modify: `src/features/schedule/components/SubjectDetailModal.tsx`
- Modify: `src/features/schedule/components/AddExamModal.tsx`
- Modify: `src/features/tasks/taskSlice.ts`
- Modify: `src/shared/notifications/notificationService.ts`
- Modify: `src/features/home/HomeScreen.tsx`
- Modify: `src/features/tasks/components/TaskDetailModal.tsx`

- [ ] **Step 1:** Create `idGenerator.ts` exporting `generateId(): number` that guarantees strictly increasing, non-colliding numeric IDs even when called in high-frequency loops.
- [ ] **Step 2:** Create `dateUtils.ts` exporting:
  - `toISODateString(date?: Date): string`
  - `formatDeadlineDisplay(isoString: string): string` (formats ISO to `"Besok, 23:59"`, `"Hari ini"`, etc.)
  - `formatShortDate(isoString: string): string`
- [ ] **Step 3:** Replace all `Date.now()` ID generations in `QuickAddModal.tsx`, `SubjectDetailModal.tsx`, `AddExamModal.tsx`, and `taskSlice.ts` with `generateId()`.
- [ ] **Step 4:** Replace raw strings like `'Besok, 23:59'` and `'Minggu Ini'` with standard ISO 8601 strings when creating tasks.
- [ ] **Step 5:** Update `HomeScreen.tsx` and `TaskDetailModal.tsx` to use `formatDeadlineDisplay(task.deadlineDate)` for humanized presentation.
- [ ] **Step 6:** Verify `notificationService.ts` parses ISO strings cleanly without `NaN` or invalid date errors.

---

### Task 3: Subtask Persistence & Data Integrity (Issue #4)

**Files:**
- Modify: `src/db/repository.ts`
- Modify: `src/features/tasks/taskSlice.ts`
- Modify: `src/features/tasks/components/TaskDetailModal.tsx`
- Modify: `src/features/focus/FocusScreen.tsx`

- [ ] **Step 1:** In `LocalDataRepository`, add `deleteSubtask(subtaskId: number): void`.
- [ ] **Step 2:** In `LocalDataRepository.saveTask`, synchronize subtasks: delete subtasks belonging to `task_id` that are no longer present in `task.subtasks`.
- [ ] **Step 3:** In `LocalDataRepository`, add `updateSubtaskCompletion(subtaskId: number, isCompleted: boolean): void`.
- [ ] **Step 4:** Connect `TaskDetailModal.tsx` and `FocusScreen.tsx` so subtask toggle, subtask creation, and subtask deletion immediately persist to SQLite.
- [ ] **Step 5:** Verify subtask deletion on emulator and confirm it remains deleted after reloading.

---

### Task 4: Notes Management & Startup Loading (Issues #5, #11)

**Files:**
- Modify: `src/db/repository.ts`
- Modify: `App.tsx`
- Create: `src/features/notes/components/NotesModal.tsx`
- Modify: `src/features/schedule/ScheduleScreen.tsx`
- Modify: `src/features/home/HomeScreen.tsx`

- [ ] **Step 1:** Add `loadNotes()`, `saveNote(note: NoteWithSubject)`, and `deleteNote(noteId: number)` to `LocalDataRepository`.
- [ ] **Step 2:** In `App.tsx`, load notes on startup via `LocalDataRepository.loadNotes()` and dispatch `setNotes(dbNotes)`.
- [ ] **Step 3:** Build `NotesModal.tsx` allowing students to view notes for the selected subject/day, write quick notes with content and subject tags, and delete notes.
- [ ] **Step 4:** Wire `+ Tulis Catatan Cepat` in `ScheduleScreen.tsx` and `HomeScreen.tsx` to open `NotesModal` and persist notes to SQLite.

---

### Task 5: Daily Streak Increment & Background Timer Engine (Issues #6, #7)

**Files:**
- Modify: `src/features/user/userSlice.ts`
- Modify: `src/db/client.ts` (schema migration for `last_active_date`)
- Modify: `src/db/repository.ts`
- Modify: `src/features/focus/focusSlice.ts`
- Modify: `src/features/focus/FocusScreen.tsx`
- Modify: `src/shared/notifications/notificationService.ts`

- [ ] **Step 1:** Add `lastActiveDate: string` to `user_profile` schema and `userSlice.ts`.
- [ ] **Step 2:** Implement `recordActivityAndCheckStreak()` in `userSlice.ts` and `repository.ts`:
  - If last active was yesterday: `streakDays += 1`.
  - If last active was today: keep streak unchanged.
  - If last active was > 1 day ago: reset `streakDays = 1`.
  - Trigger this check when completing a focus session or task.
- [ ] **Step 3:** Update `focusSlice.ts` to track `targetEndTime: number | null` (wall-clock timestamp) whenever timer is running.
- [ ] **Step 4:** Implement `AppState` listener in `FocusScreen.tsx`: when app returns from background, calculate `remainingSeconds = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000))`.
- [ ] **Step 5:** Schedule `LocalNotificationService.scheduleFocusEndNotification(seconds)` on timer start, and cancel it on pause/reset.

---

### Task 6: FocusScreen Decomposition & NativeWind Removal (Issues #9, #12)

**Files:**
- Create: `src/features/focus/components/TimerRing.tsx`
- Create: `src/features/focus/components/DurationChips.tsx`
- Create: `src/features/focus/components/FocusControls.tsx`
- Create: `src/features/focus/components/FocusSubtaskList.tsx`
- Create: `src/features/focus/components/FreeFocusGuidance.tsx`
- Create: `src/features/focus/components/TaskPickerModal.tsx`
- Create: `src/features/focus/components/CustomDurationModal.tsx`
- Refactor: `src/features/focus/FocusScreen.tsx` (< 150 lines)
- Refactor: `src/features/onboarding/OnboardingScreen.tsx` (replace NativeWind `className` with clean `StyleSheet.create`)
- Modify: `package.json` & `babel.config.js` (remove `nativewind` dependency and babel plugin)

- [ ] **Step 1:** Extract the 7 subcomponents of `FocusScreen` into `src/features/focus/components/`.
- [ ] **Step 2:** Refactor `FocusScreen.tsx` to act purely as an orchestrator importing the modular components.
- [ ] **Step 3:** Refactor `OnboardingScreen.tsx` to use `StyleSheet.create` with identical styling and responsiveness.
- [ ] **Step 4:** Remove `nativewind` from `package.json` and remove `nativewind/babel` from `babel.config.js`.
- [ ] **Step 5:** Run `bun x tsc --noEmit` to verify type safety across all components.
- [ ] **Step 6:** Verify entire app on emulator (onboarding, home, schedule, notes, focus, profile).
