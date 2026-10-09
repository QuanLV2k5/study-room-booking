import type { Building, Campus, Equipment, Room } from '@/types';

export interface RoomFilters {
  query: string;
  campus: Campus | null;
  building: Building | null;
  floor: number | null;
  minCapacity: number | null;
  equipments: readonly Equipment[];
}

export const getRoomLocation = (room: Room) =>
  room.campus === 'K'
    ? `Khu K • Tòa ${room.building} • Tầng ${room.floor}`
    : `Khu V • Tầng ${room.floor}`;

export const filterRooms = (rooms: readonly Room[], filters: RoomFilters): Room[] => {
  const keyword = filters.query.trim().toLocaleLowerCase('vi');

  return rooms.filter((room) =>
    (!keyword || `${room.name} ${getRoomLocation(room)}`.toLocaleLowerCase('vi').includes(keyword)) &&
    (!filters.campus || room.campus === filters.campus) &&
    (!filters.building || room.building === filters.building) &&
    (!filters.floor || room.floor === filters.floor) &&
    (!filters.minCapacity || room.capacity >= filters.minCapacity) &&
    filters.equipments.every((equipment) => room.equipments.includes(equipment)),
  );
};
