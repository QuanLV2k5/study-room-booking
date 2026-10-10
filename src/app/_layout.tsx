import {
    useEffect,
} from 'react';

import {
    Stack,
} from 'expo-router';

import {
    configureNotificationHandler,
} from '@/utils/notifications';

export default function RootLayout() {
    useEffect(() => {
        configureNotificationHandler();
    }, []);

    return (
        <Stack>
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name="room/[id]"
                options={{
                    title: 'Chi tiết phòng',
                    headerBackTitle:
                        'Quay lại',
                }}
            />

            <Stack.Screen
                name="scanner"
                options={{
                    title: 'Quét QR check-in',
                    headerBackTitle:
                        'Quay lại',
                }}
            />
            <Stack.Screen
                name="profile-settings"
                options={{ title: 'Chỉnh sửa hồ sơ', headerBackTitle: 'Quay lại' }}
            />
        </Stack>
    );
}
