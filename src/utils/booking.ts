import { TIME_SLOTS } from "@/constants/booking";
import { Booking } from "@/types";

export const getDateKey = (date: Date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
};

export const isRoomOccupiedNow = (
  roomId: string,
  bookings: Booking[],
  currentDate = new Date(),
) => {
  const today = getDateKey(currentDate);

  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  return bookings.some((booking) => {
    if (
      booking.roomId !== roomId ||
      booking.date !== today ||
      booking.status === "cancelled"
    ) {
      return false;
    }

    const slot = TIME_SLOTS.find((item) => item.id === booking.slotId);

    if (!slot) {
      return false;
    }

    const start = timeToMinutes(slot.start);

    const end = timeToMinutes(slot.end);

    return currentMinutes >= start && currentMinutes < end;
  });
};
