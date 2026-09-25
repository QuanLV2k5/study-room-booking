import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    MaterialCommunityIcons,
} from '@expo/vector-icons';

import { COLORS } from '../constants/theme';

interface Props {
    value: string;
    onChangeText: (
        value: string,
    ) => void;
}

export default function SearchBar({
    value,
    onChangeText,
}: Props) {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons
                name="magnify"
                size={22}
                color={COLORS.textSecondary}
            />

            <TextInput
                style={styles.input}
                placeholder="Tìm kiếm phòng..."
                placeholderTextColor={
                    COLORS.textSecondary
                }
                value={value}
                onChangeText={onChangeText}
            />

            {value.length > 0 && (
                <TouchableOpacity
                    onPress={() =>
                        onChangeText('')
                    }
                >
                    <MaterialCommunityIcons
                        name="close-circle"
                        size={20}
                        color={
                            COLORS.textSecondary
                        }
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles =
    StyleSheet.create({
        container: {
            height: 52,
            flexDirection: 'row',
            alignItems: 'center',

            paddingHorizontal: 16,

            backgroundColor:
                COLORS.white,

            borderRadius: 16,

            borderWidth: 1,
            borderColor:
                COLORS.border,

            gap: 10,
        },

        input: {
            flex: 1,

            fontSize: 15,

            color: COLORS.text,
        },
    });