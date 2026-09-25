import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import FilterSection from '@/components/FilterSection';
import RoomCard from '@/components/RoomCard';
import SearchBar from '@/components/SearchBar';

import { COLORS } from '@/constants/theme';
import { rooms } from '@/data/rooms';
import { useBookingStore } from '@/store/useBookingStore';

import {
    Building,
    Equipment,
} from '@/types';

import { isRoomOccupiedNow } from '@/utils/booking';

export default function RoomsScreen() {
    const router = useRouter();

    const bookings =
        useBookingStore(
            (state) =>
                state.bookings,
        );

    const [query, setQuery] =
        useState('');

    const [
        building,
        setBuilding,
    ] =
        useState<Building | null>(
            null,
        );

    const [
        minCapacity,
        setMinCapacity,
    ] = useState<number | null>(
        null,
    );

    const [
        equipments,
        setEquipments,
    ] =
        useState<Equipment[]>([]);

    const [now, setNow] =
        useState(Date.now());

    useEffect(() => {
        const interval =
            setInterval(() => {
                setNow(Date.now());
            }, 60000);

        return () =>
            clearInterval(interval);
    }, []);

    const toggleEquipment = (
        equipment: Equipment,
    ) => {
        setEquipments(
            (current) =>
                current.includes(
                    equipment,
                )
                    ? current.filter(
                        (item) =>
                            item !==
                            equipment,
                    )
                    : [
                        ...current,
                        equipment,
                    ],
        );
    };

    const resetFilters = () => {
        setQuery('');
        setBuilding(null);
        setMinCapacity(null);
        setEquipments([]);
    };

    const filteredRooms =
        useMemo(() => {
            const keyword =
                query
                    .trim()
                    .toLowerCase();

            return rooms.filter(
                (room) => {
                    const matchesSearch =
                        !keyword ||
                        room.name
                            .toLowerCase()
                            .includes(
                                keyword,
                            ) ||
                        room.id
                            .toLowerCase()
                            .includes(
                                keyword,
                            );

                    const matchesBuilding =
                        !building ||
                        room.building ===
                        building;

                    const matchesCapacity =
                        !minCapacity ||
                        room.capacity >=
                        minCapacity;

                    const matchesEquipment =
                        equipments.every(
                            (equipment) =>
                                room.equipments.includes(
                                    equipment,
                                ),
                        );

                    return (
                        matchesSearch &&
                        matchesBuilding &&
                        matchesCapacity &&
                        matchesEquipment
                    );
                },
            );
        }, [
            query,
            building,
            minCapacity,
            equipments,
        ]);

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <FlatList
                data={filteredRooms}
                keyExtractor={(item) =>
                    item.id
                }
                contentContainerStyle={
                    styles.list
                }
                initialNumToRender={6}
                windowSize={7}
                showsVerticalScrollIndicator={
                    false
                }
                ListHeaderComponent={
                    <View
                        style={
                            styles.header
                        }
                    >
                        <Text
                            style={styles.title}
                        >
                            StudyRoom
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Tìm không gian học
                            tập phù hợp với
                            bạn
                        </Text>

                        <View
                            style={
                                styles.search
                            }
                        >
                            <SearchBar
                                value={query}
                                onChangeText={
                                    setQuery
                                }
                            />
                        </View>

                        <FilterSection
                            building={
                                building
                            }
                            setBuilding={
                                setBuilding
                            }
                            minCapacity={
                                minCapacity
                            }
                            setMinCapacity={
                                setMinCapacity
                            }
                            equipments={
                                equipments
                            }
                            toggleEquipment={
                                toggleEquipment
                            }
                            reset={
                                resetFilters
                            }
                        />

                        <Text
                            style={
                                styles.result
                            }
                        >
                            {
                                filteredRooms.length
                            }{' '}
                            phòng phù hợp
                        </Text>
                    </View>
                }
                renderItem={({
                    item,
                }) => {
                    const occupied =
                        isRoomOccupiedNow(
                            item.id,
                            bookings,
                            new Date(now),
                        );

                    return (
                        <RoomCard
                            room={item}
                            occupied={
                                occupied
                            }
                            onPress={() =>
                                router.push({
                                    pathname: '/room/[id]',
                                    params: {
                                        id: item.id,
                                    },
                                })
                            }
                        />
                    );
                }}
                ListEmptyComponent={
                    <View
                        style={
                            styles.empty
                        }
                    >
                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            Không tìm thấy
                            phòng
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            Hãy thử thay đổi
                            bộ lọc tìm kiếm.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles =
    StyleSheet.create({
        container: {
            flex: 1,

            backgroundColor:
                COLORS.background,
        },

        list: {
            paddingHorizontal: 18,
            paddingBottom: 30,
        },

        header: {
            paddingTop: 12,
        },

        title: {
            fontSize: 28,

            fontWeight: '800',

            color: COLORS.text,
        },

        subtitle: {
            marginTop: 4,

            fontSize: 14,

            color:
                COLORS.textSecondary,
        },

        search: {
            marginTop: 20,
        },

        result: {
            marginTop: 22,

            marginBottom: 12,

            fontWeight: '700',

            fontSize: 16,

            color: COLORS.text,
        },

        empty: {
            paddingVertical: 60,

            alignItems: 'center',
        },

        emptyTitle: {
            fontSize: 18,

            fontWeight: '700',

            color: COLORS.text,
        },

        emptyText: {
            marginTop: 6,

            color:
                COLORS.textSecondary,
        },
    });