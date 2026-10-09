import type { Building, Campus } from '@/types';

interface BuildingConfig {
  building: Building;
  campus: Campus;
  roomsPerFloor: readonly number[];
  capacities: readonly number[];
}

// Each array entry represents one floor, starting at floor 1.
export const BUILDING_CONFIG: readonly BuildingConfig[] = [
  { building: 'A', campus: 'K', roomsPerFloor: [8, 8, 8, 8], capacities: [55, 60, 65] },
  { building: 'B', campus: 'K', roomsPerFloor: [10, 10, 10], capacities: [55, 60, 65] },
  { building: 'C', campus: 'K', roomsPerFloor: [5, 5], capacities: [65, 70, 75, 80] },
  { building: 'V', campus: 'V', roomsPerFloor: [6, 6, 6, 6, 6], capacities: [55, 60, 65] },
];

export const CAPACITY_FILTERS = [55, 60, 65, 70, 75, 80] as const;
