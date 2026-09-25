import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-notifications/build/NotificationPermissions";

import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";

import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";

import { cancelScheduledNotificationAsync } from "expo-notifications/build/cancelScheduledNotificationAsync";

import { SchedulableTriggerInputTypes } from "expo-notifications/build/Notifications.types";

import { TIME_SLOTS } from "@/constants/booking";

/**
 * Hiển thị local notification khi app đang mở.
 */
export function configureNotificationHandler() {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Xin quyền hiển thị notification.
 *
 * Không tạo custom Android channel vì Expo Go SDK 57
 * đang gặp lỗi NotificationsChannelsProvider.
 */
export async function requestNotificationPermission() {
  try {
    const current = await getPermissionsAsync();

    if (current.status === "granted") {
      return true;
    }

    const requested = await requestPermissionsAsync();

    return requested.status === "granted";
  } catch (error) {
    console.warn("Không thể yêu cầu quyền thông báo:", error);

    return false;
  }
}

/**
 * Tạo local notification trước giờ đặt phòng 15 phút.
 */
export async function scheduleCheckInReminder(
  date: string,
  slotId: string,
  roomName: string,
) {
  try {
    const slot = TIME_SLOTS.find((item) => item.id === slotId);

    if (!slot) {
      return undefined;
    }

    const [year, month, day] = date.split("-").map(Number);

    const [hour, minute] = slot.start.split(":").map(Number);

    const startDate = new Date(year, month - 1, day, hour, minute, 0, 0);

    const reminderDate = new Date(startDate.getTime() - 15 * 60 * 1000);

    if (reminderDate.getTime() <= Date.now()) {
      console.log("Không tạo thông báo vì thời điểm nhắc đã qua.");

      return undefined;
    }

    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      console.log("Người dùng chưa cấp quyền thông báo.");

      return undefined;
    }

    const notificationId = await scheduleNotificationAsync({
      content: {
        title: "Sắp đến giờ học 📚",

        body:
          `${roomName} sẽ bắt đầu lúc ${slot.start}. ` +
          "Bạn hãy chuẩn bị check-in.",

        sound: "default",

        data: {
          roomName,
          date,
          slotId,
        },
      },

      trigger: {
        type: SchedulableTriggerInputTypes.DATE,

        date: reminderDate,

        // KHÔNG khai báo channelId.
        // Expo sẽ dùng fallback channel
        // "Miscellaneous" trên Android.
      },
    });

    console.log("Đã tạo local notification:", notificationId);

    return notificationId;
  } catch (error) {
    console.warn("Không thể lên lịch thông báo:", error);

    return undefined;
  }
}

/**
 * Hủy notification khi người dùng hủy booking.
 */
export async function cancelCheckInReminder(notificationId?: string) {
  if (!notificationId) {
    return;
  }

  try {
    await cancelScheduledNotificationAsync(notificationId);

    console.log("Đã hủy notification:", notificationId);
  } catch (error) {
    console.warn("Không thể hủy thông báo:", error);
  }
}
