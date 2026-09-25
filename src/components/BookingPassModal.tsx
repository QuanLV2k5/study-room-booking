import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';

import { TIME_SLOTS } from '@/constants/booking';
import { COLORS } from '@/constants/theme';

import type {
    Booking,
    Room,
} from '@/types';

interface Props {
    visible: boolean;

    booking: Booking | null;

    room: Room | null;

    onClose: () => void;
}

export default function BookingPassModal({
    visible,
    booking,
    room,
    onClose,
}: Props) {
    if (!booking || !room) {
        return null;
    }

    const slot = TIME_SLOTS.find(
        (item) =>
            item.id === booking.slotId,
    );

    const qrData = JSON.stringify({
        type: 'study-room-checkin',
        bookingId: booking.id,
        passCode: booking.passCode,
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.successIcon}>
                        <Text style={styles.check}>
                            ✓
                        </Text>
                    </View>

                    <Text style={styles.title}>
                        Đặt phòng thành công
                    </Text>

                    <Text style={styles.subtitle}>
                        Booking Pass của bạn
                    </Text>

                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={qrData}
                            size={190}
                        />
                    </View>

                    <View style={styles.passCode}>
                        <Text style={styles.passLabel}>
                            MÃ ĐẶT PHÒNG
                        </Text>

                        <Text style={styles.passValue}>
                            {booking.passCode}
                        </Text>
                    </View>

                    <View style={styles.information}>
                        <InfoRow
                            label="Phòng"
                            value={room.name}
                        />

                        <InfoRow
                            label="Vị trí"
                            value={`Tòa ${room.building} • Tầng ${room.floor}`}
                        />

                        <InfoRow
                            label="Ngày"
                            value={booking.date}
                        />

                        <InfoRow
                            label="Khung giờ"
                            value={
                                slot?.label ??
                                booking.slotId
                            }
                        />
                    </View>

                    <Text style={styles.note}>
                        Vui lòng sử dụng mã QR này để
                        check-in khi đến phòng.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>
                            Hoàn tất
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
                {label}
            </Text>

            <Text style={styles.infoValue}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,

        justifyContent: 'flex-end',

        backgroundColor:
            'rgba(15, 23, 42, 0.55)',
    },

    modal: {
        backgroundColor: COLORS.white,

        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,

        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 30,

        alignItems: 'center',
    },

    successIcon: {
        width: 56,
        height: 56,

        alignItems: 'center',
        justifyContent: 'center',

        borderRadius: 28,

        backgroundColor:
            COLORS.successLight,
    },

    check: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.success,
    },

    title: {
        marginTop: 14,

        fontSize: 22,
        fontWeight: '800',

        color: COLORS.text,
    },

    subtitle: {
        marginTop: 4,

        color: COLORS.textSecondary,
    },

    qrWrapper: {
        marginTop: 22,

        padding: 14,

        borderRadius: 18,

        backgroundColor: COLORS.white,

        borderWidth: 1,
        borderColor: COLORS.border,
    },

    passCode: {
        marginTop: 15,

        alignItems: 'center',
    },

    passLabel: {
        fontSize: 11,

        color: COLORS.textSecondary,

        letterSpacing: 1,
    },

    passValue: {
        marginTop: 3,

        fontSize: 20,
        fontWeight: '800',

        color: COLORS.primary,
    },

    information: {
        width: '100%',

        marginTop: 20,

        padding: 16,

        borderRadius: 16,

        backgroundColor:
            COLORS.background,
    },

    infoRow: {
        flexDirection: 'row',

        justifyContent: 'space-between',

        marginBottom: 10,

        gap: 20,
    },

    infoLabel: {
        color: COLORS.textSecondary,
    },

    infoValue: {
        flex: 1,

        textAlign: 'right',

        fontWeight: '600',

        color: COLORS.text,
    },

    note: {
        marginTop: 16,

        textAlign: 'center',

        fontSize: 12,

        color: COLORS.textSecondary,
    },

    button: {
        width: '100%',

        marginTop: 18,

        paddingVertical: 15,

        alignItems: 'center',

        borderRadius: 14,

        backgroundColor: COLORS.primary,
    },

    buttonText: {
        color: COLORS.white,

        fontSize: 16,
        fontWeight: '700',
    },
});