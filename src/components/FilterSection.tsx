import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    Building,
    Equipment,
} from '../types';

import {
    EQUIPMENT_LABELS,
} from '../constants/booking';

import { COLORS } from '../constants/theme';

interface Props {
    building: Building | null;

    setBuilding: (
        value: Building | null,
    ) => void;

    minCapacity: number | null;

    setMinCapacity: (
        value: number | null,
    ) => void;

    equipments: Equipment[];

    toggleEquipment: (
        value: Equipment,
    ) => void;

    reset: () => void;
}

const buildings: Building[] = [
    'A',
    'B',
    'C',
    'V',
];

const capacities = [
    2,
    4,
    6,
    8,
    10,
    20,
];

const equipmentList: Equipment[] =
    [
        'projector',
        'whiteboard',
        'computer',
        'air_conditioner',
    ];

export default function FilterSection({
    building,
    setBuilding,
    minCapacity,
    setMinCapacity,
    equipments,
    toggleEquipment,
    reset,
}: Props) {
    return (
        <View style={styles.container}>
            <View
                style={styles.titleRow}
            >
                <Text style={styles.title}>
                    Bộ lọc
                </Text>

                <TouchableOpacity
                    onPress={reset}
                >
                    <Text style={styles.reset}>
                        Xóa bộ lọc
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>
                Tòa nhà
            </Text>

            <View style={styles.row}>
                {buildings.map(
                    (item) => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.chip,

                                building ===
                                item &&
                                styles.chipActive,
                            ]}
                            onPress={() =>
                                setBuilding(
                                    building === item
                                        ? null
                                        : item,
                                )
                            }
                        >
                            <Text
                                style={[
                                    styles.chipText,

                                    building ===
                                    item &&
                                    styles.chipTextActive,
                                ]}
                            >
                                Tòa {item}
                            </Text>
                        </TouchableOpacity>
                    ),
                )}
            </View>

            <Text style={styles.label}>
                Sức chứa tối thiểu
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                    false
                }
            >
                <View style={styles.row}>
                    {capacities.map(
                        (item) => (
                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.chip,

                                    minCapacity ===
                                    item &&
                                    styles.chipActive,
                                ]}
                                onPress={() =>
                                    setMinCapacity(
                                        minCapacity ===
                                            item
                                            ? null
                                            : item,
                                    )
                                }
                            >
                                <Text
                                    style={[
                                        styles.chipText,

                                        minCapacity ===
                                        item &&
                                        styles.chipTextActive,
                                    ]}
                                >
                                    {item}+
                                </Text>
                            </TouchableOpacity>
                        ),
                    )}
                </View>
            </ScrollView>

            <Text style={styles.label}>
                Trang thiết bị
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                    false
                }
            >
                <View style={styles.row}>
                    {equipmentList.map(
                        (item) => {
                            const selected =
                                equipments.includes(
                                    item,
                                );

                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.chip,

                                        selected &&
                                        styles.chipActive,
                                    ]}
                                    onPress={() =>
                                        toggleEquipment(
                                            item,
                                        )
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.chipText,

                                            selected &&
                                            styles.chipTextActive,
                                        ]}
                                    >
                                        {
                                            EQUIPMENT_LABELS[
                                            item
                                            ]
                                        }
                                    </Text>
                                </TouchableOpacity>
                            );
                        },
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles =
    StyleSheet.create({
        container: {
            marginTop: 20,
        },

        titleRow: {
            flexDirection: 'row',
            justifyContent:
                'space-between',
            alignItems: 'center',
        },

        title: {
            fontSize: 18,
            fontWeight: '700',
            color: COLORS.text,
        },

        reset: {
            color: COLORS.primary,
            fontWeight: '600',
        },

        label: {
            marginTop: 14,
            marginBottom: 8,

            fontSize: 14,

            fontWeight: '600',

            color:
                COLORS.textSecondary,
        },

        row: {
            flexDirection: 'row',
            gap: 8,
        },

        chip: {
            paddingHorizontal: 14,
            paddingVertical: 9,

            borderRadius: 20,

            borderWidth: 1,

            borderColor:
                COLORS.border,

            backgroundColor:
                COLORS.white,
        },

        chipActive: {
            backgroundColor:
                COLORS.primary,

            borderColor:
                COLORS.primary,
        },

        chipText: {
            color: COLORS.text,

            fontWeight: '500',
        },

        chipTextActive: {
            color: COLORS.white,
        },
    });