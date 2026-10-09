const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

// Compile pure TS modules in memory, resolving the project's @/ alias.
// No React Native runtime or additional test dependency is needed.
const cache = new Map();
function loadTs(relativePath) {
  const filename = path.resolve(__dirname, '..', relativePath);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const resolveImport = (specifier) => specifier.startsWith('@/')
    ? loadTs(`src/${specifier.slice(2)}.ts`)
    : require(specifier);
  new Function('require', 'module', 'exports', outputText)(resolveImport, module, module.exports);
  return module.exports;
}

const { rooms } = loadTs('src/data/rooms.ts');
const { filterRooms, getRoomLocation } = loadTs('src/utils/rooms.ts');
const { getOccupiedRoomIds, isRoomOccupiedNow } = loadTs('src/utils/booking.ts');
const defaultFilters = { query: '', campus: null, building: null, floor: null, minCapacity: null, equipments: [] };

test('102 unique rooms respect all campus, floor and capacity constraints', () => {
  assert.equal(rooms.length, 102);
  assert.equal(new Set(rooms.map((room) => room.id)).size, 102);
  const expected = { A: [8, 8, 8, 8], B: [10, 10, 10], C: [5, 5], V: [6, 6, 6, 6, 6] };
  for (const [building, counts] of Object.entries(expected)) {
    const buildingRooms = rooms.filter((room) => room.building === building);
    assert.equal(buildingRooms.length, counts.reduce((sum, count) => sum + count, 0));
    counts.forEach((count, index) => {
      assert.equal(buildingRooms.filter((room) => room.floor === index + 1).length, count);
    });
    for (const room of buildingRooms) {
      assert.equal(room.campus, building === 'V' ? 'V' : 'K');
      assert.ok(room.floor >= 1 && room.floor <= counts.length);
      assert.ok(room.capacity >= (building === 'C' ? 65 : 55));
      assert.ok(room.capacity <= (building === 'C' ? 80 : 65));
      assert.match(room.id, new RegExp(`^${building}${room.floor}\\d{2}$`));
      assert.equal(room.name, `Phòng ${room.id}`);
    }
  }
  for (const id of ['A201', 'A305', 'A402', 'B101', 'B204', 'B306', 'C103', 'C205', 'V201', 'V302', 'V405']) {
    assert.ok(rooms.some((room) => room.id === id), `Existing valid room ${id} must remain bookable`);
  }
  assert.ok(!rooms.some((room) => room.id === 'C401'));
});

test('campus, floor, capacity, search and equipment filters combine correctly', () => {
  const filter = (changes) => filterRooms(rooms, { ...defaultFilters, ...changes });
  assert.equal(filter({ campus: 'K' }).length, 72);
  assert.equal(filter({ campus: 'V' }).length, 30);
  assert.equal(filter({ building: 'A', floor: 4 }).length, 8);
  assert.equal(filter({ campus: 'V', floor: 5 }).length, 6);
  assert.equal(filter({ building: 'C', floor: 3 }).length, 0);
  assert.deepEqual(filter({ query: '  c205  ', minCapacity: 80, equipments: ['projector', 'air_conditioner'] }).map((room) => room.id), ['C205']);
  assert.equal(filter({ query: 'khu v', floor: 5 }).length, 6);
  assert.equal(filter({ query: 'tòa b', floor: 3 }).length, 10);
  assert.equal(filter({ campus: 'V', minCapacity: 70 }).length, 0);
  assert.equal(filter({ query: 'does-not-exist' }).length, 0);
  assert.equal(filter({}).length, 102);
  assert.equal(getRoomLocation(rooms.find((room) => room.id === 'A101')), 'Khu K • Tòa A • Tầng 1');
  assert.equal(getRoomLocation(rooms.find((room) => room.id === 'V501')), 'Khu V • Tầng 5');
});

test('occupancy includes active bookings, excludes cancelled/invalid/other dates', () => {
  const bookings = [
    { roomId: 'A101', date: '2026-10-09', slotId: 'slot-1', status: 'confirmed' },
    { roomId: 'B101', date: '2026-10-09', slotId: 'slot-1', status: 'checked-in' },
    { roomId: 'C101', date: '2026-10-09', slotId: 'slot-1', status: 'cancelled' },
    { roomId: 'A102', date: '2026-10-08', slotId: 'slot-1', status: 'confirmed' },
    { roomId: 'A103', date: '2026-10-10', slotId: 'slot-1', status: 'confirmed' },
    { roomId: 'V101', date: '2026-10-09', slotId: 'invalid', status: 'confirmed' },
    { roomId: 'A201', date: '2026-10-09', slotId: 'slot-2', status: 'confirmed' },
    { roomId: 'V201', date: '2026-10-09', slotId: 'slot-3', status: 'confirmed' },
    { roomId: 'C205', date: '2026-10-09', slotId: 'slot-4', status: 'confirmed' },
  ];
  const occupiedAt = (hour, minute) => getOccupiedRoomIds(bookings, new Date(2026, 9, 9, hour, minute));
  assert.deepEqual(occupiedAt(7, 29), new Set());
  assert.deepEqual(occupiedAt(7, 30), new Set(['A101', 'B101']));
  assert.deepEqual(occupiedAt(9, 29), new Set(['A101', 'B101']));
  assert.deepEqual(occupiedAt(9, 30), new Set(['A201']));
  assert.deepEqual(occupiedAt(11, 30), new Set());
  assert.deepEqual(occupiedAt(13, 0), new Set(['V201']));
  assert.deepEqual(occupiedAt(15, 0), new Set(['C205']));
  assert.deepEqual(occupiedAt(17, 0), new Set());
  assert.equal(isRoomOccupiedNow('A101', bookings, new Date(2026, 9, 9, 8)), true);
  assert.equal(isRoomOccupiedNow('C101', bookings, new Date(2026, 9, 9, 8)), false);
});
