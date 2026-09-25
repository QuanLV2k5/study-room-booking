import {
    useState,
} from 'react';

import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    SafeAreaView,
} from 'react-native-safe-area-context';

import BookingPassModal from '@/components/BookingPassModal';

import {
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
    cancelCheckInReminder,
} from '@/utils/notifications';

export default function BookingsScreen() {
    const bookings =
        useBookingStore(
            (state) =>
                state.bookings,
        );

    const cancelBooking =
        useBookingStore(
            (state) =>
                state.cancelBooking,
        );

    const [
        selectedBooking,
        setSelectedBooking,
    ] =
        useState<Booking | null>(
            null,
        );

    const [
        showPass,
        setShowPass,
    ] = useState(false);

    const selectedRoom =
        selectedBooking
            ? rooms.find(
                (room) =>
                    room.id ===
                    selectedBooking.roomId,
            ) ?? null
            : null;

    const openBookingPass = (
        booking: Booking,
    ) => {
        setSelectedBooking(
            booking,
        );

        setShowPass(true);
    };

    const handleCancel = (
        booking: Booking,
    ) => {
        Alert.alert(
            'Hủy đặt phòng',
            'Bạn có chắc chắn muốn hủy lịch đặt này không?',
            [
                {
                    text: 'Không',
                    style: 'cancel',
                },

                {
                    text: 'Hủy đặt phòng',
                    style: 'destructive',

                    onPress: async () => {
                        try {
                            await cancelCheckInReminder(
                                booking.notificationId,
                            );
                        } catch (error) {
                            console.warn(
                                'Không thể hủy thông báo:',
                                error,
                            );
                        }

                        cancelBooking(
                            booking.id,
                        );
                    },
                },
            ],
        );
    };

    return (
        <>
            <SafeAreaView
                style={styles.container}
                edges={['top']}
            >
                <FlatList
                    data={bookings}
                    keyExtractor={(item) =>
                        item.id
                    }
                    showsVerticalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.list
                    }
                    ListHeaderComponent={
                        <View>
                            <Text
                                style={styles.title}
                            >
                                Lịch đặt phòng
                            </Text>

                            <Text
                                style={
                                    styles.subtitle
                                }
                            >
                                Quản lý các phòng
                                bạn đã đặt
                            </Text>
                        </View>
                    }
                    renderItem={({
                        item,
                    }) => {
                        const room =
                            rooms.find(
                                (roomItem) =>
                                    roomItem.id ===
                                    item.roomId,
                            );

                        const slot =
                            TIME_SLOTS.find(
                                (slotItem) =>
                                    slotItem.id ===
                                    item.slotId,
                            );

                        const cancelled =
                            item.status ===
                            'cancelled';

                        const checkedIn =
                            item.status ===
                            'checked-in';

                        return (
                            <View
                                style={[
                                    styles.card,

                                    cancelled &&
                                    styles.cardCancelled,
                                ]}
                            >
                                <View
                                    style={
                                        styles.cardHeader
                                    }
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <Text
                                            style={
                                                styles.roomName
                                            }
                                        >
                                            {room?.name ??
                                                item.roomId}
                                        </Text>

                                        <Text
                                            style={
                                                styles.location
                                            }
                                        >
                                            {room
                                                ? `Tòa ${room.building} • Tầng ${room.floor}`
                                                : ''}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.status,

                                            cancelled
                                                ? styles.statusCancelled
                                                : checkedIn
                                                    ? styles.statusCheckedIn
                                                    : styles.statusConfirmed,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,

                                                cancelled
                                                    ? styles.cancelledText
                                                    : checkedIn
                                                        ? styles.checkedInText
                                                        : styles.confirmedText,
                                            ]}
                                        >
                                            {cancelled
                                                ? 'Đã hủy'
                                                : checkedIn
                                                    ? 'Đã check-in'
                                                    : 'Đã xác nhận'}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={
                                        styles.details
                                    }
                                >
                                    <Text
                                        style={
                                            styles.detailText
                                        }
                                    >
                                        📅 {item.date}
                                    </Text>

                                    <Text
                                        style={
                                            styles.detailText
                                        }
                                    >
                                        🕐{' '}
                                        {slot?.label ??
                                            item.slotId}
                                    </Text>

                                    <Text
                                        style={
                                            styles.passCode
                                        }
                                    >
                                        Mã:{' '}
                                        {item.passCode}
                                    </Text>
                                </View>

                                {!cancelled && (
                                    <TouchableOpacity
                                        style={
                                            styles.qrButton
                                        }
                                        onPress={() =>
                                            openBookingPass(
                                                item,
                                            )
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.qrButtonText
                                            }
                                        >
                                            Xem Booking Pass
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {!cancelled &&
                                    !checkedIn && (
                                        <TouchableOpacity
                                            style={
                                                styles.cancelButton
                                            }
                                            onPress={() =>
                                                handleCancel(
                                                    item,
                                                )
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.cancelButtonText
                                                }
                                            >
                                                Hủy đặt phòng
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                            </View>
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
                                    styles.emptyIcon
                                }
                            >
                                📅
                            </Text>

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                Chưa có lịch đặt
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Các phòng bạn đặt
                                sẽ xuất hiện tại
                                đây.
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>

            <BookingPassModal
                visible={showPass}
                booking={
                    selectedBooking
                }
                room={
                    selectedRoom
                }
                onClose={() => {
                    setShowPass(false);
                    setSelectedBooking(
                        null,
                    );
                }}
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

        list: {
            padding: 18,
            paddingBottom: 40,
        },

        title: {
            fontSize: 27,

            fontWeight: '800',

            color: COLORS.text,
        },

        subtitle: {
            marginTop: 4,
            marginBottom: 22,

            color:
                COLORS.textSecondary,
        },

        card: {
            marginBottom: 14,

            padding: 17,

            borderRadius: 18,

            backgroundColor:
                COLORS.white,

            borderWidth: 1,

            borderColor:
                COLORS.border,
        },

        cardCancelled: {
            opacity: 0.65,
        },

        cardHeader: {
            flexDirection: 'row',

            justifyContent:
                'space-between',

            alignItems:
                'flex-start',

            gap: 10,
        },

        roomName: {
            fontSize: 18,

            fontWeight: '700',

            color: COLORS.text,
        },

        location: {
            marginTop: 3,

            fontSize: 13,

            color:
                COLORS.textSecondary,
        },

        status: {
            paddingHorizontal: 9,
            paddingVertical: 5,

            borderRadius: 20,
        },

        statusConfirmed: {
            backgroundColor:
                COLORS.primaryLight,
        },

        statusCheckedIn: {
            backgroundColor:
                COLORS.successLight,
        },

        statusCancelled: {
            backgroundColor:
                COLORS.dangerLight,
        },

        statusText: {
            fontSize: 11,
            fontWeight: '700',
        },

        confirmedText: {
            color: COLORS.primary,
        },

        checkedInText: {
            color: COLORS.success,
        },

        cancelledText: {
            color: COLORS.danger,
        },

        details: {
            marginTop: 16,

            gap: 7,
        },

        detailText: {
            color:
                COLORS.textSecondary,
        },

        passCode: {
            marginTop: 4,

            color: COLORS.primary,

            fontWeight: '700',
        },

        qrButton: {
            marginTop: 16,

            paddingVertical: 11,

            alignItems: 'center',

            borderRadius: 10,

            backgroundColor:
                COLORS.primary,
        },

        qrButtonText: {
            color: COLORS.white,

            fontWeight: '700',
        },

        cancelButton: {
            marginTop: 9,

            paddingVertical: 11,

            alignItems: 'center',

            borderRadius: 10,

            borderWidth: 1,

            borderColor:
                COLORS.danger,
        },

        cancelButtonText: {
            color: COLORS.danger,

            fontWeight: '600',
        },

        empty: {
            alignItems: 'center',

            paddingVertical: 90,
        },

        emptyIcon: {
            fontSize: 45,
        },

        emptyTitle: {
            marginTop: 12,

            fontSize: 19,
            fontWeight: '700',

            color: COLORS.text,
        },

        emptyText: {
            marginTop: 6,

            color:
                COLORS.textSecondary,
        },
    });