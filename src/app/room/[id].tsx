import {
    useMemo,
    useState,
} from 'react';

import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    useLocalSearchParams,
} from 'expo-router';

import BookingPassModal from '@/components/BookingPassModal';
import DateSelector from '@/components/DateSelector';
import TimeSlotGrid from '@/components/TimeSlotGrid';

import {
    EQUIPMENT_LABELS,
    TIME_SLOTS,
} from '@/constants/booking';

import { COLORS } from '@/constants/theme';

import { rooms } from '@/data/rooms';

import {
    useBookingStore,
} from '@/store/useBookingStore';

import type {
    Booking,
} from '@/types';

import {
    getDateKey,
} from '@/utils/booking';

import {
    scheduleCheckInReminder,
} from '@/utils/notifications';

export default function RoomDetailScreen() {
    const { id } =
        useLocalSearchParams<{
            id: string;
        }>();

    const room = rooms.find(
        (item) => item.id === id,
    );

    const user =
        useBookingStore(
            (state) => state.user,
        );

    const addBooking =
        useBookingStore(
            (state) =>
                state.addBooking,
        );

    const isSlotBooked =
        useBookingStore(
            (state) =>
                state.isSlotBooked,
        );

    const [baseDate] =
        useState(() => new Date());

    const dates = useMemo(
        () =>
            Array.from(
                { length: 7 },
                (_, index) => {
                    const date =
                        new Date(baseDate);

                    date.setDate(
                        baseDate.getDate() +
                        index,
                    );

                    return date;
                },
            ),
        [baseDate],
    );

    const [
        selectedDate,
        setSelectedDate,
    ] = useState(() =>
        getDateKey(baseDate),
    );

    const [
        selectedSlotId,
        setSelectedSlotId,
    ] =
        useState<string | null>(
            null,
        );

    const [
        createdBooking,
        setCreatedBooking,
    ] =
        useState<Booking | null>(
            null,
        );

    const [
        showPass,
        setShowPass,
    ] = useState(false);

    if (!room) {
        return (
            <View style={styles.center}>
                <Text>
                    Không tìm thấy phòng.
                </Text>
            </View>
        );
    }

    const slotIsPast = (
        slotId: string,
    ) => {
        const today =
            getDateKey(baseDate);

        if (
            selectedDate !== today
        ) {
            return false;
        }

        const slot =
            TIME_SLOTS.find(
                (item) =>
                    item.id === slotId,
            );

        if (!slot) {
            return true;
        }

        const [
            hour,
            minute,
        ] = slot.start
            .split(':')
            .map(Number);

        const slotStart =
            new Date(baseDate);

        slotStart.setHours(
            hour,
            minute,
            0,
            0,
        );

        return (
            slotStart.getTime() <=
            baseDate.getTime()
        );
    };

    const handleDateSelect = (
        date: string,
    ) => {
        setSelectedDate(date);

        setSelectedSlotId(null);
    };

    const handleBooking =
        async () => {
            if (!selectedSlotId) {
                Alert.alert(
                    'Chưa chọn khung giờ',
                    'Vui lòng chọn một khung giờ trước khi đặt phòng.',
                );

                return;
            }

            const alreadyBooked =
                isSlotBooked(
                    room.id,
                    selectedDate,
                    selectedSlotId,
                );

            if (alreadyBooked) {
                Alert.alert(
                    'Khung giờ không khả dụng',
                    'Khung giờ này vừa được đặt. Vui lòng chọn khung giờ khác.',
                );

                setSelectedSlotId(
                    null,
                );

                return;
            }

            const timestamp =
                Date.now();

            const randomCode =
                Math.random()
                    .toString(36)
                    .substring(2, 7)
                    .toUpperCase();

            const bookingId =
                `BOOK-${timestamp}`;

            const passCode =
                `SR-${randomCode}`;

            let notificationId:
                | string
                | undefined;

            try {
                notificationId =
                    await scheduleCheckInReminder(
                        selectedDate,
                        selectedSlotId,
                        room.name,
                    );
            } catch (error) {
                console.warn(
                    'Không thể tạo thông báo:',
                    error,
                );
            }

            const booking: Booking =
            {
                id: bookingId,

                passCode,

                roomId: room.id,

                userId: user.id,

                date:
                    selectedDate,

                slotId:
                    selectedSlotId,

                status:
                    'confirmed',

                createdAt:
                    new Date()
                        .toISOString(),

                notificationId,
            };

            addBooking(booking);

            setCreatedBooking(
                booking,
            );

            setShowPass(true);

            setSelectedSlotId(
                null,
            );
        };

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={
                    false
                }
            >
                <Image
                    source={{
                        uri: room.image,
                    }}
                    style={styles.image}
                />

                <Text style={styles.title}>
                    {room.name}
                </Text>

                <Text style={styles.location}>
                    Tòa {room.building} •
                    Tầng {room.floor}
                </Text>

                <View
                    style={styles.capacity}
                >
                    <Text
                        style={
                            styles.capacityText
                        }
                    >
                        👥 Tối đa{' '}
                        {room.capacity}{' '}
                        sinh viên
                    </Text>
                </View>

                <Text
                    style={styles.sectionTitle}
                >
                    Trang thiết bị
                </Text>

                <View
                    style={styles.equipmentList}
                >
                    {room.equipments.map(
                        (equipment) => (
                            <View
                                key={equipment}
                                style={
                                    styles.equipment
                                }
                            >
                                <Text
                                    style={
                                        styles.equipmentText
                                    }
                                >
                                    {
                                        EQUIPMENT_LABELS[
                                        equipment
                                        ]
                                    }
                                </Text>
                            </View>
                        ),
                    )}
                </View>

                <Text
                    style={styles.sectionTitle}
                >
                    Chọn ngày
                </Text>

                <DateSelector
                    dates={dates}
                    selectedDate={
                        selectedDate
                    }
                    onSelect={
                        handleDateSelect
                    }
                />

                <Text
                    style={styles.sectionTitle}
                >
                    Chọn khung giờ
                </Text>

                <TimeSlotGrid
                    selectedSlotId={
                        selectedSlotId
                    }
                    isBooked={(
                        slotId,
                    ) =>
                        isSlotBooked(
                            room.id,
                            selectedDate,
                            slotId,
                        )
                    }
                    isPast={
                        slotIsPast
                    }
                    onSelect={
                        setSelectedSlotId
                    }
                />

                <View
                    style={styles.legend}
                >
                    <Text
                        style={
                            styles.legendText
                        }
                    >
                        Khung giờ đã được
                        đặt sẽ tự động bị vô
                        hiệu hóa.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.bookingButton,

                        !selectedSlotId &&
                        styles.bookingButtonDisabled,
                    ]}
                    disabled={
                        !selectedSlotId
                    }
                    onPress={
                        handleBooking
                    }
                >
                    <Text
                        style={
                            styles.bookingButtonText
                        }
                    >
                        Đặt phòng
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <BookingPassModal
                visible={showPass}
                booking={
                    createdBooking
                }
                room={room}
                onClose={() =>
                    setShowPass(false)
                }
            />
        </>
    );
}

const styles =
    StyleSheet.create({
        container: {
            flex: 1,

            backgroundColor:
                COLORS.background,
        },

        content: {
            padding: 18,
            paddingBottom: 40,
        },

        center: {
            flex: 1,

            alignItems: 'center',
            justifyContent: 'center',
        },

        image: {
            width: '100%',
            height: 220,

            borderRadius: 20,

            backgroundColor:
                COLORS.border,
        },

        title: {
            marginTop: 18,

            fontSize: 27,
            fontWeight: '800',

            color: COLORS.text,
        },

        location: {
            marginTop: 5,

            fontSize: 15,

            color:
                COLORS.textSecondary,
        },

        capacity: {
            alignSelf:
                'flex-start',

            marginTop: 14,

            paddingHorizontal: 12,
            paddingVertical: 8,

            borderRadius: 10,

            backgroundColor:
                COLORS.primaryLight,
        },

        capacityText: {
            color: COLORS.primary,

            fontWeight: '600',
        },

        sectionTitle: {
            marginTop: 26,
            marginBottom: 12,

            fontSize: 18,
            fontWeight: '700',

            color: COLORS.text,
        },

        equipmentList: {
            flexDirection: 'row',
            flexWrap: 'wrap',

            gap: 8,
        },

        equipment: {
            paddingHorizontal: 12,
            paddingVertical: 8,

            borderRadius: 10,

            backgroundColor:
                COLORS.white,

            borderWidth: 1,
            borderColor:
                COLORS.border,
        },

        equipmentText: {
            fontSize: 13,

            color: COLORS.text,
        },

        legend: {
            marginTop: 15,

            padding: 12,

            borderRadius: 12,

            backgroundColor:
                '#F1F5F9',
        },

        legendText: {
            fontSize: 12,

            color:
                COLORS.textSecondary,
        },

        bookingButton: {
            marginTop: 25,

            paddingVertical: 16,

            alignItems: 'center',

            borderRadius: 15,

            backgroundColor:
                COLORS.primary,
        },

        bookingButtonDisabled: {
            opacity: 0.45,
        },

        bookingButtonText: {
            color: COLORS.white,

            fontSize: 16,
            fontWeight: '700',
        },
    });