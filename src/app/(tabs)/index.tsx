import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import FilterSection from '@/components/FilterSection';
import RoomCard from '@/components/RoomCard';
import SearchBar from '@/components/SearchBar';
import { COLORS } from '@/constants/theme';
import { rooms } from '@/data/rooms';
import { useBookingStore } from '@/store/useBookingStore';
import type { Building, Campus, Equipment, Room } from '@/types';
import { getOccupiedRoomIds } from '@/utils/booking';
import { filterRooms } from '@/utils/rooms';

const keyExtractor = (room: Room) => room.id;
const emptyList = (
  <View style={{ paddingVertical: 60, alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>Không tìm thấy phòng</Text>
    <Text style={{ marginTop: 6, color: COLORS.textSecondary }}>Hãy thử thay đổi bộ lọc tìm kiếm.</Text>
  </View>
);

export default function RoomsScreen() {
  const bookings = useBookingStore((state) => state.bookings);
  const listRef = useRef<FlatList<Room>>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [campus, setCampus] = useState<Campus | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [floor, setFloor] = useState<number | null>(null);
  const [minCapacity, setMinCapacity] = useState<number | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [now, setNow] = useState(() => Date.now());

  // Refresh on return; skip clock updates in inactive screens/apps.
  useFocusEffect(useCallback(() => {
    const refresh = () => setNow(Date.now());
    refresh();
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') refresh();
    }, 60000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []));

  const selectCampus = useCallback((value: Campus | null) => {
    setCampus(value);
    setBuilding(null);
    setFloor(null);
  }, []);

  const selectBuilding = useCallback((value: Building | null) => {
    setBuilding(value);
    setFloor(null);
  }, []);

  const toggleEquipment = useCallback((equipment: Equipment) => {
    setEquipments((current) => current.includes(equipment)
      ? current.filter((item) => item !== equipment)
      : [...current, equipment]);
  }, []);

  const resetFilters = useCallback(() => {
    setQuery('');
    setCampus(null);
    setBuilding(null);
    setFloor(null);
    setMinCapacity(null);
    setEquipments([]);
  }, []);

  const filteredRooms = useMemo(() => filterRooms(rooms, {
    query: deferredQuery, campus, building, floor, minCapacity, equipments,
  }), [deferredQuery, campus, building, floor, minCapacity, equipments]);

  // Constant-time status lookup during row rendering, including rapid scrolling.
  const occupiedRoomIds = useMemo(() => getOccupiedRoomIds(bookings, new Date(now)), [bookings, now]);
  const openRoom = useCallback((id: string) => {
    router.push({ pathname: '/room/[id]', params: { id } });
  }, []);
  const renderRoom = useCallback<ListRenderItem<Room>>(({ item }) => (
    <RoomCard room={item} occupied={occupiedRoomIds.has(item.id)} onPress={openRoom} />
  ), [occupiedRoomIds, openRoom]);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [filteredRooms]);

  const header = useMemo(() => (
    <View style={styles.header}>
      <Text style={styles.title}>StudyRoom</Text>
      <Text style={styles.subtitle}>Phòng học khu K và khu V • {rooms.length} phòng</Text>
      <View style={styles.search}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>
      <FilterSection
        campus={campus} setCampus={selectCampus}
        building={building} setBuilding={selectBuilding}
        floor={floor} setFloor={setFloor}
        minCapacity={minCapacity} setMinCapacity={setMinCapacity}
        equipments={equipments} toggleEquipment={toggleEquipment} reset={resetFilters}
      />
      <Text style={styles.result}>{filteredRooms.length} / {rooms.length} phòng phù hợp</Text>
    </View>
  ), [query, campus, selectCampus, building, selectBuilding, floor, minCapacity,
    equipments, toggleEquipment, resetFilters, filteredRooms.length]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ref={listRef}
        data={filteredRooms}
        keyExtractor={keyExtractor}
        renderItem={renderRoom}
        extraData={occupiedRoomIds}
        ListHeaderComponent={header}
        ListEmptyComponent={emptyList}
        contentContainerStyle={styles.list}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        updateCellsBatchingPeriod={32}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  header: { paddingTop: 12 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { marginTop: 4, fontSize: 14, color: COLORS.textSecondary },
  search: { marginTop: 20 },
  result: { marginTop: 22, marginBottom: 12, fontWeight: '700', fontSize: 16, color: COLORS.text },
});
