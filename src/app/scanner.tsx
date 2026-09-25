import {
    useState,
} from 'react';

import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    CameraView,
    useCameraPermissions,
} from 'expo-camera';

import {
    useRouter,
} from 'expo-router';

import { COLORS } from '@/constants/theme';

import {
    useBookingStore,
} from '@/store/useBookingStore';

import {
    cancelCheckInReminder,
} from '@/utils/notifications';

interface BookingQRPayload {
    type: string;
    bookingId: string;
    passCode: string;
}

export default function ScannerScreen() {
    const router = useRouter();

    const [
        permission,
        requestPermission,
    ] = useCameraPermissions();

    const [
        scanned,
        setScanned,
    ] = useState(false);

    const bookings =
        useBookingStore(
            (state) => state.bookings,
        );

    const checkIn =
        useBookingStore(
            (state) => state.checkIn,
        );

    const handleBarcodeScanned =
        async ({
            data,
        }: {
            data: string;
        }) => {
            if (scanned) {
                return;
            }

            setScanned(true);

            let payload: BookingQRPayload;

            try {
                payload =
                    JSON.parse(data);
            } catch {
                Alert.alert(
                    'QR không hợp lệ',
                    'Mã QR này không phải Booking Pass của StudyRoom.',
                    [
                        {
                            text: 'Quét lại',
                            onPress: () =>
                                setScanned(false),
                        },
                    ],
                );

                return;
            }

            if (
                payload.type !==
                'study-room-checkin' ||
                !payload.bookingId ||
                !payload.passCode
            ) {
                Alert.alert(
                    'QR không hợp lệ',
                    'Nội dung QR không đúng định dạng Booking Pass.',
                    [
                        {
                            text: 'Quét lại',
                            onPress: () =>
                                setScanned(false),
                        },
                    ],
                );

                return;
            }

            const booking =
                bookings.find(
                    (item) =>
                        item.id ===
                        payload.bookingId,
                );

            if (!booking) {
                Alert.alert(
                    'Không tìm thấy booking',
                    'Booking Pass này không tồn tại trên thiết bị.',
                    [
                        {
                            text: 'Quét lại',
                            onPress: () =>
                                setScanned(false),
                        },
                    ],
                );

                return;
            }

            if (
                booking.passCode !==
                payload.passCode
            ) {
                Alert.alert(
                    'Mã đặt phòng không đúng',
                    'Booking ID tồn tại nhưng Pass Code không khớp.',
                    [
                        {
                            text: 'Quét lại',
                            onPress: () =>
                                setScanned(false),
                        },
                    ],
                );

                return;
            }

            if (
                booking.status ===
                'cancelled'
            ) {
                Alert.alert(
                    'Booking đã bị hủy',
                    'Không thể check-in bằng Booking Pass này.',
                    [
                        {
                            text: 'Quét lại',
                            onPress: () =>
                                setScanned(false),
                        },
                    ],
                );

                return;
            }

            if (
                booking.status ===
                'checked-in'
            ) {
                Alert.alert(
                    'Đã check-in',
                    'Booking này đã được check-in trước đó.',
                    [
                        {
                            text: 'Đóng',
                            onPress: () =>
                                router.back(),
                        },
                    ],
                );

                return;
            }

            checkIn(booking.id);

            try {
                await cancelCheckInReminder(
                    booking.notificationId,
                );
            } catch (error) {
                console.warn(
                    'Không thể hủy reminder sau check-in:',
                    error,
                );
            }

            Alert.alert(
                'Check-in thành công',
                `Mã ${booking.passCode} đã được xác nhận.`,
                [
                    {
                        text: 'Hoàn tất',
                        onPress: () =>
                            router.back(),
                    },
                ],
            );
        };

    if (!permission) {
        return (
            <View style={styles.center}>
                <Text style={styles.loadingText}>
                    Đang kiểm tra quyền camera...
                </Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <View style={styles.permissionCard}>
                    <Text style={styles.permissionIcon}>
                        📷
                    </Text>

                    <Text style={styles.permissionTitle}>
                        Cần quyền truy cập camera
                    </Text>

                    <Text
                        style={
                            styles.permissionDescription
                        }
                    >
                        StudyRoom cần sử dụng camera để
                        quét mã QR Booking Pass.
                    </Text>

                    <TouchableOpacity
                        style={
                            styles.permissionButton
                        }
                        onPress={() => {
                            void requestPermission();
                        }}
                    >
                        <Text
                            style={
                                styles.permissionButtonText
                            }
                        >
                            Cho phép camera
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={
                    scanned
                        ? undefined
                        : handleBarcodeScanned
                }
            />

            <View style={styles.overlay}>
                <View style={styles.topContent}>
                    <Text style={styles.title}>
                        Quét Booking Pass
                    </Text>

                    <Text style={styles.description}>
                        Đưa mã QR vào giữa khung hình
                    </Text>
                </View>

                <View style={styles.scannerFrame}>
                    <View
                        style={[
                            styles.corner,
                            styles.topLeft,
                        ]}
                    />

                    <View
                        style={[
                            styles.corner,
                            styles.topRight,
                        ]}
                    />

                    <View
                        style={[
                            styles.corner,
                            styles.bottomLeft,
                        ]}
                    />

                    <View
                        style={[
                            styles.corner,
                            styles.bottomRight,
                        ]}
                    />
                </View>

                <View style={styles.bottomContent}>
                    {scanned ? (
                        <TouchableOpacity
                            style={styles.rescanButton}
                            onPress={() =>
                                setScanned(false)
                            }
                        >
                            <Text
                                style={
                                    styles.rescanButtonText
                                }
                            >
                                Quét lại
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.hint}>
                            Camera sẽ tự động nhận diện QR
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles =
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#000000',
        },

        center: {
            flex: 1,

            alignItems: 'center',
            justifyContent: 'center',

            backgroundColor:
                COLORS.background,
        },

        loadingText: {
            color:
                COLORS.textSecondary,
        },

        permissionContainer: {
            flex: 1,

            padding: 24,

            justifyContent:
                'center',

            backgroundColor:
                COLORS.background,
        },

        permissionCard: {
            padding: 24,

            alignItems: 'center',

            borderRadius: 22,

            backgroundColor:
                COLORS.white,

            borderWidth: 1,
            borderColor:
                COLORS.border,
        },

        permissionIcon: {
            fontSize: 52,
        },

        permissionTitle: {
            marginTop: 14,

            fontSize: 21,
            fontWeight: '800',

            color: COLORS.text,

            textAlign: 'center',
        },

        permissionDescription: {
            marginTop: 8,

            fontSize: 14,
            lineHeight: 20,

            textAlign: 'center',

            color:
                COLORS.textSecondary,
        },

        permissionButton: {
            width: '100%',

            marginTop: 22,

            paddingVertical: 15,

            alignItems: 'center',

            borderRadius: 14,

            backgroundColor:
                COLORS.primary,
        },

        permissionButtonText: {
            color: COLORS.white,

            fontSize: 15,
            fontWeight: '700',
        },

        overlay: {
            flex: 1,

            alignItems: 'center',

            justifyContent:
                'space-between',

            paddingTop: 55,
            paddingBottom: 50,

            backgroundColor:
                'rgba(0,0,0,0.28)',
        },

        topContent: {
            alignItems: 'center',

            paddingHorizontal: 24,
        },

        title: {
            fontSize: 25,
            fontWeight: '800',

            color: '#FFFFFF',
        },

        description: {
            marginTop: 7,

            fontSize: 14,

            color:
                'rgba(255,255,255,0.85)',
        },

        scannerFrame: {
            width: 260,
            height: 260,

            position: 'relative',
        },

        corner: {
            position: 'absolute',

            width: 46,
            height: 46,

            borderColor:
                '#FFFFFF',
        },

        topLeft: {
            top: 0,
            left: 0,

            borderTopWidth: 5,
            borderLeftWidth: 5,

            borderTopLeftRadius: 15,
        },

        topRight: {
            top: 0,
            right: 0,

            borderTopWidth: 5,
            borderRightWidth: 5,

            borderTopRightRadius: 15,
        },

        bottomLeft: {
            bottom: 0,
            left: 0,

            borderBottomWidth: 5,
            borderLeftWidth: 5,

            borderBottomLeftRadius: 15,
        },

        bottomRight: {
            bottom: 0,
            right: 0,

            borderBottomWidth: 5,
            borderRightWidth: 5,

            borderBottomRightRadius: 15,
        },

        bottomContent: {
            minHeight: 52,

            justifyContent:
                'center',

            alignItems: 'center',
        },

        hint: {
            color: '#FFFFFF',

            fontSize: 13,
        },

        rescanButton: {
            paddingHorizontal: 25,
            paddingVertical: 13,

            borderRadius: 13,

            backgroundColor:
                COLORS.primary,
        },

        rescanButtonText: {
            color: COLORS.white,

            fontWeight: '700',
        },
    });