import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior for foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class LocalNotificationService {
  /**
   * Request notification permissions from user
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('myasisstent-deadline', {
          name: 'Pengingat Deadline & Jadwal',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        });
      }

      return true;
    } catch (err) {
      console.warn('Notification permission error:', err);
      return false;
    }
  }

  /**
   * Schedule H-1 Day deadline reminder for a task
   */
  static async scheduleTaskDeadlineReminder(
    taskId: number,
    taskTitle: string,
    deadlineDateStr: string
  ): Promise<string | null> {
    try {
      const deadline = new Date(deadlineDateStr);
      if (isNaN(deadline.getTime())) return null;

      // H-1 day reminder (24 hours before)
      const triggerDateH1 = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);

      // Only schedule if the trigger time is in the future
      if (triggerDateH1.getTime() > Date.now()) {
        const notifId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Maskot: Deadline Besok!',
            body: `Tugas "${taskTitle}" harus dikumpulkan besok. Yuk cicil 1 sesi fokus sekarang biar ga panik!`,
            data: { taskId, type: 'task_h1' },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDateH1,
          },
        });
        return notifId;
      }
      return null;
    } catch (err) {
      console.warn('Failed to schedule deadline notification:', err);
      return null;
    }
  }

  /**
   * Schedule Exam countdown reminder
   */
  static async scheduleExamReminder(
    examId: number,
    examTitle: string,
    examDateStr: string,
    daysLeft: number
  ): Promise<string | null> {
    try {
      // Parse exam date (YYYY-MM-DD)
      const [year, month, day] = examDateStr.split('-').map(Number);
      // Target reminder: H-1 morning at 07:00 AM
      const triggerDate = new Date(year, month - 1, day - 1, 7, 0, 0);
      const examMorning = new Date(year, month - 1, day, 6, 30, 0);
      const now = Date.now();

      let scheduledTrigger: Date | null = null;
      if (triggerDate.getTime() > now) {
        scheduledTrigger = triggerDate;
      } else if (examMorning.getTime() > now) {
        // If H-1 07:00 has already passed, schedule reminder for tonight at 19:00 or shortly ahead
        const tonight = new Date();
        tonight.setHours(19, 0, 0, 0);
        if (tonight.getTime() > now && tonight.getTime() < examMorning.getTime()) {
          scheduledTrigger = tonight;
        } else {
          scheduledTrigger = new Date(now + 15 * 60 * 1000); // 15 minutes from now
        }
      }

      if (scheduledTrigger) {
        const notifId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Maskot: Ujian ${examTitle} Tinggal Sedikit Lagi!`,
            body: `Ujian "${examTitle}" tinggal ${Math.max(1, daysLeft)} hari lagi. Buka aplikasi untuk review catatan!`,
            data: { examId, type: 'exam_countdown' },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: scheduledTrigger,
          },
        });
        return notifId;
      }
      return null;
    } catch (err) {
      console.warn('Failed to schedule exam notification:', err);
      return null;
    }
  }

  /**
   * Schedule notification when Focus timer finishes
   */
  static async scheduleFocusEndReminder(
    durationSeconds: number,
    taskTitle?: string
  ): Promise<string | null> {
    try {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Sesi Fokus Selesai!',
          body: taskTitle
            ? `Target fokus untuk "${taskTitle}" tuntas. Ambil jeda istirahat sejenak!`
            : 'Sesi belajarmu tuntas! Klaim reward EXP kamu sekarang.',
          data: { type: 'focus_completed' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, durationSeconds),
        },
      });
      return notifId;
    } catch (err) {
      console.warn('Failed to schedule focus end notification:', err);
      return null;
    }
  }

  /**
   * Cancel specific scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (err) {
      console.warn('Failed to cancel notification:', err);
    }
  }

  /**
   * Cancel all notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      console.warn('Failed to cancel all notifications:', err);
    }
  }
}

