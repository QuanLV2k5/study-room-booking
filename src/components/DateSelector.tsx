import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

import { COLORS } from '@/constants/theme';
import { getDateKey } from '@/utils/booking';

interface Props {
    dates: Date[];
    selectedDate: string;
    onSelect: (date: string) => void;
}

const DAY_NAMES = [
    'CN',
    'T2',
    'T3',
    'T4',
    'T5',
    'T6',
    'T7',
];

export default function DateSelector({
    dates,
    selectedDate,
    onSelect,
}: Props) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {dates.map((date) => {
                const dateKey = getDateKey(date);
                const selected = dateKey === selectedDate;

                return (
                    <TouchableOpacity
                        key={dateKey}
                        style={[
                            styles.item,
                            selected && styles.itemSelected,
                        ]}
                        onPress={() => onSelect(dateKey)}
                    >
                        <Text
                            style={[
                                styles.day,
                                selected && styles.textSelected,
                            ]}
                        >
                            {DAY_NAMES[date.getDay()]}
                        </Text>

                        <Text
                            style={[
                                styles.date,
                                selected && styles.textSelected,
                            ]}
                        >
                            {date.getDate()}
                        </Text>

                        <Text
                            style={[
                                styles.month,
                                selected && styles.textSelected,
                            ]}
                        >
                            Tháng {date.getMonth() + 1}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 10,
        paddingVertical: 4,
    },

    item: {
        width: 72,
        paddingVertical: 12,
        alignItems: 'center',

        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,

        backgroundColor: COLORS.white,
    },

    itemSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    day: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },

    date: {
        marginTop: 3,

        fontSize: 22,
        fontWeight: '800',

        color: COLORS.text,
    },

    month: {
        marginTop: 2,

        fontSize: 11,
        color: COLORS.textSecondary,
    },

    textSelected: {
        color: COLORS.white,
    },
});