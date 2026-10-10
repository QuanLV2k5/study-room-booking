const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadTs(filename, resolveImport = require) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', filename), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(resolveImport, module, module.exports);
  return module.exports;
}

const { getProfileFields, validateProfile } = loadTs('src/utils/profile.ts');
const fields = { name: 'Nguyễn Văn An', studentId: '23IT000', email: '', phone: '' };

test('legacy profiles support blank optional contacts; normalize Vietnamese names, MSSV and phone', () => {
  assert.deepEqual(getProfileFields({ id: 'user-001', name: fields.name, studentId: fields.studentId }), fields);
  assert.equal(validateProfile(fields).valid, true);
  assert.deepEqual(validateProfile({
    name: '  Lê   Minh Quân  ', studentId: ' 24it123 ', email: ' quan@example.com ', phone: '+84 912-345-678',
  }), { valid: true, fields: { name: 'Lê Minh Quân', studentId: '24IT123', email: 'quan@example.com', phone: '+84912345678' } });
  assert.equal(validateProfile({ ...fields, name: '李四' }).valid, true);
});

test('invalid required fields and malformed optional contacts report field errors', () => {
  const result = validateProfile({ name: ' ', studentId: '23 IT', email: 'invalid-email', phone: '123' });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['email', 'name', 'phone', 'studentId']);
  assert.equal(validateProfile({ ...fields, name: 'A'.repeat(81) }).valid, false);
  assert.equal(validateProfile({ ...fields, name: '123' }).valid, false);
  assert.equal(validateProfile({ ...fields, studentId: 'A'.repeat(21) }).valid, false);
  assert.equal(validateProfile({ ...fields, phone: '0987654321' }).valid, true);
});

async function createStoreFixture() {
  const disk = new Map();
  let failNextWrite = false;
  const storage = {
    getItem: async (key) => disk.get(key) ?? null,
    setItem: async (key, value) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      if (failNextWrite) { failNextWrite = false; throw new Error('Storage unavailable'); }
      disk.set(key, value);
    },
    removeItem: async (key) => { disk.delete(key); },
  };
  const { useBookingStore: store } = loadTs('src/store/useBookingStore.ts', (specifier) =>
    specifier === '@react-native-async-storage/async-storage' ? { __esModule: true, default: storage } : require(specifier));
  await store.persist.rehydrate();
  return { store, disk, failWrite: () => { failNextWrite = true; } };
}

test('profile saves await persistence and preserve identity and existing bookings', async () => {
  const { store, disk } = await createStoreFixture();
  const bookings = [{ id: 'BOOK-1', userId: store.getState().user.id, roomId: 'A101', status: 'confirmed' }];
  await store.setState({ bookings });
  const id = store.getState().user.id;
  await store.getState().setUser({ id: 'different-id', name: 'Lê Minh Quân', studentId: '24IT123', email: 'quan@example.com' });
  const saved = JSON.parse(disk.get('study-room-booking-storage')).state;
  assert.equal(saved.user.id, id);
  assert.equal(saved.user.email, 'quan@example.com');
  assert.equal(saved.user.name, 'Lê Minh Quân');
  assert.deepEqual(saved.bookings, bookings);
  assert.deepEqual(store.getState().bookings, bookings);
});

test('failed persistence reports failure and restores the previous profile', async () => {
  const { store, disk, failWrite } = await createStoreFixture();
  const previous = store.getState().user;
  await store.getState().setUser(previous);
  failWrite();
  await assert.rejects(store.getState().setUser({ ...previous, name: 'Changed name' }), /Storage unavailable/);
  assert.deepEqual(store.getState().user, previous);
  assert.deepEqual(JSON.parse(disk.get('study-room-booking-storage')).state.user, previous);
});
