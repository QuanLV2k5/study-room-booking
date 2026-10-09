import { memo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Building, Campus, Equipment } from '@/types';
import { EQUIPMENT_LABELS } from '@/constants/booking';
import { BUILDING_CONFIG, CAPACITY_FILTERS } from '@/constants/rooms';
import { COLORS } from '@/constants/theme';

interface Props {
  campus: Campus | null;
  setCampus: (value: Campus | null) => void;
  building: Building | null;
  setBuilding: (value: Building | null) => void;
  floor: number | null;
  setFloor: (value: number | null) => void;
  minCapacity: number | null;
  setMinCapacity: (value: number | null) => void;
  equipments: Equipment[];
  toggleEquipment: (value: Equipment) => void;
  reset: () => void;
}

function FilterChip({ label, selected, onPress }: {
  label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipActive]}
      onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const campuses: Campus[] = ['K', 'V'];
const equipmentList: Equipment[] = ['projector', 'whiteboard', 'computer', 'air_conditioner'];

function FilterSection({ campus, setCampus, building, setBuilding, floor, setFloor,
  minCapacity, setMinCapacity, equipments, toggleEquipment, reset }: Props) {
  const [expanded, setExpanded] = useState(false);
  const activeFilters = Number(Boolean(campus)) + Number(Boolean(building)) +
    Number(Boolean(floor)) + Number(Boolean(minCapacity)) + equipments.length;
  const buildings = BUILDING_CONFIG.filter((config) => !campus || config.campus === campus);
  const floorCount = Math.max(...buildings
    .filter((config) => !building || config.building === building)
    .map((config) => config.roomsPerFloor.length));

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <TouchableOpacity
          onPress={() => setExpanded((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Thu gọn bộ lọc' : 'Mở bộ lọc'}
          accessibilityState={{ expanded }}
        >
          <Text style={styles.title}>
            Bộ lọc{activeFilters > 0 ? ` (${activeFilters})` : ''} {expanded ? '▴' : '▾'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={reset} accessibilityRole="button">
          <Text style={styles.reset}>Xóa bộ lọc</Text>
        </TouchableOpacity>
      </View>
      {expanded && <View>
      <Text style={styles.label}>Khu học</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {campuses.map((item) => <FilterChip key={item} label={`Khu ${item}`}
            selected={campus === item} onPress={() => setCampus(campus === item ? null : item)} />)}
        </View>
      </ScrollView>
      {campus !== 'V' && <>
        <Text style={styles.label}>Tòa nhà</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {buildings.map(({ building: item }) => <FilterChip key={item}
              label={item === 'V' ? 'Khu V' : `Tòa ${item} (K)`}
              selected={building === item} onPress={() => setBuilding(building === item ? null : item)} />)}
          </View>
        </ScrollView>
      </>}
      <Text style={styles.label}>Tầng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {Array.from({ length: floorCount }, (_, index) => index + 1).map((item) => (
            <FilterChip key={item} label={`Tầng ${item}`} selected={floor === item}
              onPress={() => setFloor(floor === item ? null : item)} />
          ))}
        </View>
      </ScrollView>
      <Text style={styles.label}>Sức chứa tối thiểu</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {CAPACITY_FILTERS.map((item) => <FilterChip key={item} label={`${item}+ sinh viên`}
            selected={minCapacity === item} onPress={() => setMinCapacity(minCapacity === item ? null : item)} />)}
        </View>
      </ScrollView>
      <Text style={styles.label}>Trang thiết bị</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {equipmentList.map((item) => <FilterChip key={item} label={EQUIPMENT_LABELS[item]}
            selected={equipments.includes(item)} onPress={() => toggleEquipment(item)} />)}
        </View>
      </ScrollView>
      </View>}
    </View>
  );
}

export default memo(FilterSection);

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  reset: { color: COLORS.primary, fontWeight: '600' },
  label: { marginTop: 14, marginBottom: 8, fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  row: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.border, backgroundColor: COLORS.white },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.text, fontWeight: '500' },
  chipTextActive: { color: COLORS.white },
});
