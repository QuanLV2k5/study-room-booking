import { BUILDING_CONFIG } from '@/constants/rooms';
import type { Equipment, Room } from '@/types';

// Illustrative photos shared across rooms, so scrolling reuses cached images.
const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70',
];

// Sample room capacities and equipment based on the supplied campus layout.
// Replace these values with the actual inventory when it becomes available.
export const rooms: Room[] = BUILDING_CONFIG.flatMap((config, buildingIndex) =>
  config.roomsPerFloor.flatMap((count, floorIndex) =>
    Array.from({ length: count }, (_, roomIndex): Room => {
      const floor = floorIndex + 1;
      const variant = floorIndex + roomIndex + buildingIndex;
      const id = `${config.building}${floor}${String(roomIndex + 1).padStart(2, '0')}`;
      const equipments: Equipment[] = ['projector', 'whiteboard'];

      if (variant % 3 !== 0) equipments.push('air_conditioner');
      if (variant % 4 === 0) equipments.push('computer');

      return {
        id,
        name: `Phòng ${id}`,
        building: config.building,
        campus: config.campus,
        floor,
        capacity: config.capacities[variant % config.capacities.length],
        equipments,
        image: ROOM_IMAGES[variant % ROOM_IMAGES.length],
      };
    }),
  ),
);
