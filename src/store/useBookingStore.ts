import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

import { Booking, UserSession } from "@/types";

interface BookingState {
  user: UserSession;

  bookings: Booking[];

  setUser: (user: UserSession) => Promise<void>;

  addBooking: (booking: Booking) => void;

  cancelBooking: (bookingId: string) => void;

  checkIn: (bookingId: string) => void;

  isSlotBooked: (roomId: string, date: string, slotId: string) => boolean;

  getRoomBookings: (roomId: string, date: string) => Booking[];
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      user: {
        id: "user-001",
        name: "Nguyễn Văn An",
        studentId: "23IT000",
      },

      bookings: [],

      setUser: async (user) => {
        const previous = get().user;
        try {
          // persist wraps set and returns the AsyncStorage write promise.
          // Profile edits preserve the identity referenced by existing bookings.
          await set({ user: { ...user, id: previous.id } });
        } catch (error) {
          try {
            await set({ user: previous });
          } catch {
            // Restore the in-memory profile even if storage remains unavailable.
          }
          throw error;
        }
      },

      addBooking: (booking) => {
        set((state) => ({
          bookings: [booking, ...state.bookings],
        }));
      },

      cancelBooking: (bookingId) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === bookingId
              ? {
                  ...booking,
                  status: "cancelled",
                }
              : booking,
          ),
        }));
      },

      checkIn: (bookingId) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === bookingId
              ? {
                  ...booking,
                  status: "checked-in",
                }
              : booking,
          ),
        }));
      },

      isSlotBooked: (roomId, date, slotId) => {
        return get().bookings.some(
          (booking) =>
            booking.roomId === roomId &&
            booking.date === date &&
            booking.slotId === slotId &&
            booking.status !== "cancelled",
        );
      },

      getRoomBookings: (roomId, date) => {
        return get().bookings.filter(
          (booking) =>
            booking.roomId === roomId &&
            booking.date === date &&
            booking.status !== "cancelled",
        );
      },
    }),

    {
      name: "study-room-booking-storage",

      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        user: state.user,
        bookings: state.bookings,
      }),
    },
  ),
);
