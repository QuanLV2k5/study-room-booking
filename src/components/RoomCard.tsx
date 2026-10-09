import React, { useCallback } from 'react';
import { Image } from 'expo-image';
import { getRoomLocation } from '@/utils/rooms';

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    MaterialCommunityIcons,
} from '@expo/vector-icons';

import {
    EQUIPMENT_LABELS,
} from '../constants/booking';

import { COLORS } from '../constants/theme';

import { Room } from '../types';

interface Props {
    room: Room;
    occupied: boolean;
    onPress: (roomId: string) => void;
}

function RoomCard({
    room,
    occupied,
    onPress,
}: Props) {
    const handlePress = useCallback(() => onPress(room.id), [onPress, room.id]);
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={`${room.name}, ${getRoomLocation(room)}, ${room.capacity} sinh viên, ${occupied ? 'đang sử dụng' : 'đang trống'}`}
        >
            <Image
                source={room.image}
                style={styles.image}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={0}
            />

            <View style={styles.content}>
                <View
                    style={styles.header}
                >
                    <Text style={styles.name} numberOfLines={1}>
                        {room.name}
                    </Text>

                    <View
                        style={[
                            styles.status,

                            occupied
                                ? styles.statusBusy
                                : styles.statusFree,
                        ]}
                    >
                        <View
                            style={[
                                styles.dot,

                                {
                                    backgroundColor:
                                        occupied
                                            ? COLORS.danger
                                            : COLORS.success,
                                },
                            ]}
                        />

                        <Text
                            style={[
                                styles.statusText,

                                {
                                    color: occupied
                                        ? COLORS.danger
                                        : COLORS.success,
                                },
                            ]}
                        >
                            {occupied
                                ? 'Đang sử dụng'
                                : 'Đang trống'}
                        </Text>
                    </View>
                </View>

                <View style={styles.info}>
                    <MaterialCommunityIcons
                        name="office-building"
                        size={18}
                        color={
                            COLORS.textSecondary
                        }
                    />

                    <Text
                        style={
                            styles.infoText
                        }
                    >
                        {getRoomLocation(room)}
                    </Text>
                </View>

                <View style={styles.info}>
                    <MaterialCommunityIcons
                        name="account-group"
                        size={18}
                        color={
                            COLORS.textSecondary
                        }
                    />

                    <Text
                        style={
                            styles.infoText
                        }
                    >
                        Tối đa {room.capacity}{' '}
                        sinh viên
                    </Text>
                </View>

                <View
                    style={styles.equipment}
                >
                    {room.equipments
                        .slice(0, 2)
                        .map((item) => (
                            <View
                                key={item}
                                style={
                                    styles.equipmentChip
                                }
                            >
                                <Text
                                    style={
                                        styles.equipmentText
                                    }
                                >
                                    {
                                        EQUIPMENT_LABELS[
                                        item
                                        ]
                                    }
                                </Text>
                            </View>
                        ))}

                    {room.equipments.length >
                        2 && (
                            <View
                                style={
                                    styles.equipmentChip
                                }
                            >
                                <Text
                                    style={
                                        styles.equipmentText
                                    }
                                >
                                    +
                                    {room.equipments
                                        .length - 2}
                                </Text>
                            </View>
                        )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default React.memo(
    RoomCard,
);

const styles =
    StyleSheet.create({
        card: {
            backgroundColor:
                COLORS.card,

            borderRadius: 18,

            overflow: 'hidden',

            marginBottom: 16,

            borderWidth: 1,

            borderColor:
                COLORS.border,
        },

        image: {
            width: '100%',
            height: 160,

            backgroundColor:
                COLORS.border,
        },

        content: {
            padding: 16,
        },

        header: {
            flexDirection: 'row',

            justifyContent:
                'space-between',

            alignItems:
                'flex-start',

            gap: 10,

            marginBottom: 12,
        },

        name: {
            flex: 1,

            fontSize: 19,

            fontWeight: '700',

            color: COLORS.text,
        },

        status: {
            flexDirection: 'row',

            alignItems: 'center',

            paddingHorizontal: 9,

            paddingVertical: 5,

            borderRadius: 20,

            gap: 5,
        },

        statusFree: {
            backgroundColor:
                COLORS.successLight,
        },

        statusBusy: {
            backgroundColor:
                COLORS.dangerLight,
        },

        dot: {
            width: 7,
            height: 7,
            borderRadius: 10,
        },

        statusText: {
            fontSize: 11,

            fontWeight: '700',
        },

        info: {
            flexDirection: 'row',

            alignItems: 'center',

            gap: 7,

            marginBottom: 7,
        },

        infoText: {
            flex: 1,
            fontSize: 14,

            color:
                COLORS.textSecondary,
        },

        equipment: {
            flexDirection: 'row',

            flexWrap: 'wrap',

            gap: 6,

            marginTop: 8,
        },

        equipmentChip: {
            backgroundColor:
                COLORS.primaryLight,

            paddingHorizontal: 9,

            paddingVertical: 5,

            borderRadius: 8,
        },

        equipmentText: {
            color: COLORS.primary,

            fontSize: 11,

            fontWeight: '600',
        },
    });
