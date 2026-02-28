import { LocalNotifications } from '@capacitor/local-notifications';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { CalcMethod, PrayerName } from '../store/usePrayerStore';

const PRAYER_NAMES_AR: Record<string, string> = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء'
};

export const setupNotifications = async () => {
  try {
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display !== 'granted') {
      console.warn('Notification permission denied');
      return false;
    }

    // Create the high-priority channel for Android custom sound
    await LocalNotifications.createChannel({
      id: 'prayers_channel',
      name: 'مواقيت الصلاة',
      description: 'إشعارات دقيقة لمواقيت الصلاة',
      sound: 'notifications.wav',
      importance: 5, // High importance
      visibility: 1, // Public on lockscreen
      vibration: true
    });

    return true;
  } catch (e) {
    console.error('Error requesting notification permission', e);
    return false;
  }
};

export const schedulePrayerNotifications = async (lat: number, lng: number, method: CalcMethod) => {
  try {
    const hasPermission = await setupNotifications();
    if (!hasPermission) return;

    // Clear existing notifications
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const coords = new Coordinates(lat, lng);
    const params = CalculationMethod[method]();

    const notificationsToSchedule = [];
    let notifId = 1;

    // Schedule for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const pTimes = new PrayerTimes(coords, date, params);

      const prayers = [
        { id: 'fajr', time: pTimes.fajr },
        { id: 'dhuhr', time: pTimes.dhuhr },
        { id: 'asr', time: pTimes.asr },
        { id: 'maghrib', time: pTimes.maghrib },
        { id: 'isha', time: pTimes.isha }
      ];

      for (const prayer of prayers) {
        if (prayer.time > new Date()) { // Only schedule future prayers
          notificationsToSchedule.push({
            id: notifId++,
            title: `حان الآن موعد صلاة ${PRAYER_NAMES_AR[prayer.id]}`,
            body: 'يا باغي الخير أقبل.. حان وقت اللقاء بربك، قم إلى صلاتك 🕌',
            schedule: { at: prayer.time },
            sound: 'notifications.wav',
            channelId: 'prayers_channel',
          });
        }
      }
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule
      });
      console.log(`Scheduled ${notificationsToSchedule.length} prayer notifications.`);
    }
  } catch (error) {
    console.error('Failed to schedule notifications', error);
  }
};

export const cancelAllNotifications = async () => {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
      console.log('Cancelled all notifications.');
    }
  } catch (error) {
    console.error('Failed to cancel notifications', error);
  }
};

export const testNotification = async () => {
  try {
    const hasPermission = await setupNotifications();
    if (!hasPermission) return;

    const testTime = new Date();
    testTime.setSeconds(testTime.getSeconds() + 3);

    await LocalNotifications.schedule({
      notifications: [{
        id: 9999,
        title: 'تجربة إشعار مِحْرَاب 🕌',
        body: 'هكذا ستبدو وتُسمع إشعارات الصلاة القادمة. نسأل الله القبول!',
        schedule: { at: testTime },
        sound: 'notifications.wav',
        channelId: 'prayers_channel',
      }]
    });
    console.log('Test notification scheduled in 3 seconds.');
  } catch (error) {
    console.error('Failed to schedule test notification', error);
  }
};
