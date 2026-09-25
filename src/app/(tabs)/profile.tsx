import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    SafeAreaView,
} from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

import { COLORS } from '@/constants/theme';

import {
    useBookingStore,
} from '@/store/useBookingStore';

export default function ProfileScreen() {
    const router = useRouter();

    const user =
        useBookingStore(
            (state) => state.user,
        );

    const bookings =
        useBookingStore(
            (state) => state.bookings,
        );

    const activeBookings =
        bookings.filter(
            (booking) =>
                booking.status !== 'cancelled',
        );

    const checkedInBookings =
        bookings.filter(
            (booking) =>
                booking.status === 'checked-in',
        );

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <View style={styles.content}>
                <Text style={styles.title}>
                    Cá nhân
                </Text>

                <Text style={styles.subtitle}>
                    Thông tin người dùng và trạng thái đặt phòng
                </Text>

                <View style={styles.card}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user.name
                                .charAt(0)
                                .toUpperCase()}
                        </Text>
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={styles.name}>
                            {user.name}
                        </Text>

                        <Text style={styles.studentId}>
                            MSSV: {user.studentId}
                        </Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>
                            {activeBookings.length}
                        </Text>

                        <Text style={styles.statLabel}>
                            Lịch đặt
                        </Text>
                    </View>

                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>
                            {checkedInBookings.length}
                        </Text>

                        <Text style={styles.statLabel}>
                            Đã check-in
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>
                    Check-in phòng học
                </Text>

                <View style={styles.scannerCard}>
                    <Text style={styles.scannerIcon}>
                        ▣
                    </Text>

                    <View style={styles.scannerContent}>
                        <Text style={styles.scannerTitle}>
                            Quét mã QR
                        </Text>

                        <Text style={styles.scannerDescription}>
                            Quét Booking Pass để xác nhận check-in
                            vào phòng học.
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.scannerButton}
                    activeOpacity={0.85}
                    onPress={() =>
                        router.push('/scanner')
                    }
                >
                    <Text style={styles.scannerButtonText}>
                        Mở máy quét QR
                    </Text>
                </TouchableOpacity>

                <View style={styles.noteCard}>
                    <Text style={styles.noteTitle}>
                        Hướng dẫn
                    </Text>

                    <Text style={styles.noteText}>
                        Booking Pass được tạo sau khi đặt phòng.
                        Mã QR chỉ hợp lệ khi booking chưa bị hủy
                        và mã đặt phòng khớp với dữ liệu đã lưu.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    content: {
        padding: 20,
    },

    title: {
        fontSize: 27,
        fontWeight: '800',
        color: COLORS.text,
    },

    subtitle: {
        marginTop: 5,
        fontSize: 14,
        color: COLORS.textSecondary,
    },

    card: {
        marginTop: 24,
        padding: 20,
        borderRadius: 18,
        backgroundColor: COLORS.primary,

        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },

    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,

        backgroundColor:
            'rgba(255,255,255,0.18)',

        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.white,
    },

    userInfo: {
        flex: 1,
    },

    name: {
        color: COLORS.white,
        fontSize: 21,
        fontWeight: '700',
    },

    studentId: {
        marginTop: 5,
        color: '#DBEAFE',
        fontSize: 14,
    },

    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },

    stat: {
        flex: 1,

        padding: 18,

        borderRadius: 18,

        backgroundColor: COLORS.white,

        borderWidth: 1,
        borderColor: COLORS.border,
    },

    statNumber: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.primary,
    },

    statLabel: {
        marginTop: 4,
        color: COLORS.textSecondary,
    },

    sectionTitle: {
        marginTop: 26,
        marginBottom: 12,

        fontSize: 18,
        fontWeight: '700',

        color: COLORS.text,
    },

    scannerCard: {
        padding: 18,

        borderRadius: 18,

        backgroundColor: COLORS.white,

        borderWidth: 1,
        borderColor: COLORS.border,

        flexDirection: 'row',
        alignItems: 'center',

        gap: 14,
    },

    scannerIcon: {
        fontSize: 38,
        color: COLORS.primary,
    },

    scannerContent: {
        flex: 1,
    },

    scannerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },

    scannerDescription: {
        marginTop: 4,

        fontSize: 13,
        lineHeight: 19,

        color: COLORS.textSecondary,
    },

    scannerButton: {
        marginTop: 14,

        paddingVertical: 15,

        alignItems: 'center',

        borderRadius: 14,

        backgroundColor: COLORS.primary,
    },

    scannerButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '700',
    },

    noteCard: {
        marginTop: 16,

        padding: 16,

        borderRadius: 14,

        backgroundColor:
            COLORS.primaryLight,
    },

    noteTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },

    noteText: {
        marginTop: 6,

        fontSize: 12,
        lineHeight: 18,

        color: COLORS.textSecondary,
    },
});