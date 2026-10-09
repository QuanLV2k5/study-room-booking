const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/utils/check-in.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const helpers = {};
new Function('exports', outputText)(helpers);
const { parseBookingQR, selectImageBookingQR, validateBookingQR } = helpers;
const booking = {
  id: 'BOOK-QR-TEST', passCode: 'SR-TEST1', roomId: 'A101', userId: 'user-001',
  date: '2026-10-09', slotId: 'slot-1', status: 'confirmed', createdAt: '2026-10-09T00:00:00Z',
};
const payload = { type: 'study-room-checkin', bookingId: booking.id, passCode: booking.passCode };
const data = JSON.stringify(payload);

test('QR parsing rejects malformed, null, incomplete and non-string credentials', () => {
  for (const invalid of ['not-json', 'null', '[]', '{}', '42', JSON.stringify({ ...payload, type: 'other' }),
    JSON.stringify({ ...payload, bookingId: 123 }), JSON.stringify({ ...payload, passCode: {} }),
    JSON.stringify({ ...payload, bookingId: ' ' }), JSON.stringify({ ...payload, passCode: '' })]) {
    assert.equal(parseBookingQR(invalid), null);
    assert.equal(validateBookingQR(invalid, [booking]).status, 'invalid');
  }
  assert.deepEqual(parseBookingQR(data), payload);
});

test('camera and image payloads share pass/status validation', () => {
  assert.deepEqual(validateBookingQR(data, [booking]), { status: 'ready', booking });
  assert.equal(validateBookingQR(data, []).title, 'Không tìm thấy booking');
  assert.equal(validateBookingQR(JSON.stringify({ ...payload, passCode: 'wrong' }), [booking]).title, 'Mã đặt phòng không đúng');
  assert.equal(validateBookingQR(data, [{ ...booking, status: 'cancelled' }]).title, 'Booking đã bị hủy');
  assert.equal(validateBookingQR(data, [{ ...booking, status: 'checked-in' }]).status, 'already-checked-in');
});

test('image selection distinguishes no QR, wrong QR, one pass and multiple passes', () => {
  assert.equal(selectImageBookingQR([]).status, 'empty');
  assert.equal(selectImageBookingQR([{ data: 'https://example.com' }, { data: 'null' }]).status, 'invalid');
  assert.deepEqual(selectImageBookingQR([{ data: 'other' }, { data }]), { status: 'selected', data });
  const formatted = JSON.stringify({ passCode: payload.passCode, type: payload.type, bookingId: payload.bookingId }, null, 2);
  assert.equal(selectImageBookingQR([{ data }, { data: formatted }]).status, 'selected');
  assert.equal(selectImageBookingQR([{ data }, { data: JSON.stringify({ ...payload, bookingId: 'BOOK-OTHER' }) }]).status, 'ambiguous');
  assert.equal(selectImageBookingQR([{ data }, { data: JSON.stringify({ ...payload, passCode: 'SR-OTHER' }) }]).status, 'ambiguous');
});
