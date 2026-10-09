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
  return getOccupiedRoomIds(bookings, currentDate).has(roomId);
};

// Scan bookings once per update, rather than once for every visible room.
export const getOccupiedRoomIds = (
  bookings: readonly Booking[],
  currentDate = new Date(),
): Set<string> => {
  const today = getDateKey(currentDate);

  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  const occupied = new Set<string>();
  const activeSlots = new Set(
    TIME_SLOTS.filter((slot) =>
      currentMinutes >= timeToMinutes(slot.start) &&
      currentMinutes < timeToMinutes(slot.end),
    ).map((slot) => slot.id),
  );

  for (const booking of bookings) {
    if (
      booking.date !== today ||
      booking.status === "cancelled"
    ) {
      continue;
    }

    if (activeSlots.has(booking.slotId)) {
      occupied.add(booking.roomId);
    }
  }

  return occupied;
};
