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
      // Notification morning of H-3 or H-1
      const triggerDate = new Date();
      triggerDate.setDate(triggerDate.getDate() + Math.max(1, daysLeft - 1));
      triggerDate.setHours(7, 0, 0, 0);

      if (triggerDate.getTime() > Date.now()) {
        const notifId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Maskot: Ujian ${examTitle} Tinggal Sedikit Lagi!`,
            body: `Ujian "${examTitle}" tinggal ${daysLeft} hari lagi. Buka aplikasi untuk review catatan!`,
            data: { examId, type: 'exam_countdown' },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
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

