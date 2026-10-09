import type { Booking } from '@/types';

export interface BookingQRPayload {
  type: 'study-room-checkin';
  bookingId: string;
  passCode: string;
}

export function parseBookingQR(data: string): BookingQRPayload | null {
  try {
    const payload: unknown = JSON.parse(data);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
    const value = payload as Record<string, unknown>;
    if (value.type !== 'study-room-checkin' ||
      typeof value.bookingId !== 'string' || !value.bookingId.trim() ||
      typeof value.passCode !== 'string' || !value.passCode.trim()) return null;
    return { type: value.type, bookingId: value.bookingId, passCode: value.passCode };
  } catch {
    return null;
  }
}

type ValidationResult =
  | { status: 'ready'; booking: Booking }
  | { status: 'already-checked-in' | 'invalid'; title: string; message: string };

export function validateBookingQR(data: string, bookings: readonly Booking[]): ValidationResult {
  const payload = parseBookingQR(data);
  if (!payload) return {
    status: 'invalid', title: 'QR không hợp lệ',
    message: 'Mã QR này không phải Booking Pass của StudyRoom.',
  };
  const booking = bookings.find((item) => item.id === payload.bookingId);
  if (!booking) return {
    status: 'invalid', title: 'Không tìm thấy booking',
    message: 'Booking Pass này không tồn tại trên thiết bị.',
  };
  if (booking.passCode !== payload.passCode) return {
    status: 'invalid', title: 'Mã đặt phòng không đúng',
    message: 'Booking ID tồn tại nhưng Pass Code không khớp.',
  };
  if (booking.status === 'cancelled') return {
    status: 'invalid', title: 'Booking đã bị hủy',
    message: 'Không thể check-in bằng Booking Pass này.',
  };
  if (booking.status === 'checked-in') return {
    status: 'already-checked-in', title: 'Đã check-in',
    message: 'Booking này đã được check-in trước đó.',
  };
  return { status: 'ready', booking };
}

// Ignore unrelated QR codes and deduplicate the same pass. Do not automatically
// check in an arbitrary booking when an image contains different Booking Passes.
export function selectImageBookingQR(results: readonly { data: string }[]):
  | { status: 'selected'; data: string }
  | { status: 'empty' | 'ambiguous' | 'invalid' } {
  if (results.length === 0) return { status: 'empty' };
  const passes = new Map<string, string>();
  for (const { data } of results) {
    const payload = parseBookingQR(data);
    if (payload) passes.set(JSON.stringify(payload), data);
  }
  if (passes.size > 1) return { status: 'ambiguous' };
  const data = passes.values().next().value;
  return data ? { status: 'selected', data } : { status: 'invalid' };
}
