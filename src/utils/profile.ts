import type { UserSession } from '@/types';

export interface ProfileFields {
  name: string;
  studentId: string;
  email: string;
  phone: string;
}
export type ProfileErrors = Partial<Record<keyof ProfileFields, string>>;

export const getProfileFields = (user: UserSession): ProfileFields => ({
  name: user.name, studentId: user.studentId, email: user.email ?? '', phone: user.phone ?? '',
});

export function validateProfile(fields: ProfileFields):
  | { valid: true; fields: ProfileFields }
  | { valid: false; errors: ProfileErrors } {
  const normalized: ProfileFields = {
    name: fields.name.normalize('NFC').trim().replace(/\s+/g, ' '),
    studentId: fields.studentId.trim().toUpperCase(),
    email: fields.email.trim(),
    phone: fields.phone.trim().replace(/[\s().-]/g, ''),
  };
  const errors: ProfileErrors = {};
  if (normalized.name.length < 2 || normalized.name.length > 80 || !/\p{L}/u.test(normalized.name)) {
    errors.name = 'Vui lòng nhập họ tên từ 2 đến 80 ký tự.';
  }
  if (!/^[A-Z0-9]{3,20}$/.test(normalized.studentId)) {
    errors.studentId = 'MSSV cần từ 3 đến 20 ký tự, chỉ gồm chữ cái và số.';
  }
  if (normalized.email && (normalized.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email))) {
    errors.email = 'Vui lòng nhập địa chỉ email hợp lệ.';
  }
  if (normalized.phone && !/^\+?[0-9]{9,15}$/.test(normalized.phone)) {
    errors.phone = 'Số điện thoại cần từ 9 đến 15 chữ số, có thể bắt đầu bằng +.';
  }
  return Object.keys(errors).length ? { valid: false, errors } : { valid: true, fields: normalized };
}
