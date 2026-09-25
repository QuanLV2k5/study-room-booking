import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { TIME_SLOTS } from '@/constants/booking';
import { COLORS } from '@/constants/theme';

interface Props {
    selectedSlotId: string | null;

    isBooked: (slotId: string) => boolean;

    isPast: (slotId: string) => boolean;

    onSelect: (slotId: string) => void;
}

export default function TimeSlotGrid({
    selectedSlotId,
    isBooked,
    isPast,
    onSelect,
}: Props) {
    return (
        <View style={styles.container}>
            {TIME_SLOTS.map((slot) => {
                const booked = isBooked(slot.id);
                const past = isPast(slot.id);

                const disabled = booked || past;

                const selected =
                    selectedSlotId === slot.id;

                return (
                    <TouchableOpacity
                        key={slot.id}
                        disabled={disabled}
                        onPress={() => onSelect(slot.id)}
                        style={[
                            styles.slot,

                            selected &&
                            !disabled &&
                            styles.slotSelected,

                            disabled &&
                            styles.slotDisabled,
                        ]}
                    >
                        <Text
                            style={[
                                styles.time,

                                selected &&
                                !disabled &&
                                styles.selectedText,

                                disabled &&
                                styles.disabledText,
                            ]}
                        >
                            {slot.label}
                        </Text>

                        <Text
                            style={[
                                styles.status,

                                selected &&
                                !disabled &&
                                styles.selectedText,

                                disabled &&
                                styles.disabledText,
                            ]}
                        >
                            {booked
                                ? 'Đã được đặt'
                                : past
                                    ? 'Đã qua'
                                    : selected
                                        ? 'Đã chọn'
                                        : 'Có thể đặt'}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    slot: {
        width: '48%',

        paddingVertical: 15,
        paddingHorizontal: 12,

        borderWidth: 1,
        borderColor: COLORS.border,

        borderRadius: 14,

        backgroundColor: COLORS.white,
    },

    slotSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    slotDisabled: {
        backgroundColor: '#F1F5F9',
        borderColor: '#CBD5E1',
    },

    time: {
        fontSize: 14,
        fontWeight: '700',

        color: COLORS.text,
    },

    status: {
        marginTop: 4,

        fontSize: 11,

        color: COLORS.success,
    },

    selectedText: {
        color: COLORS.white,
    },

    disabledText: {
        color: '#94A3B8',
    },
});