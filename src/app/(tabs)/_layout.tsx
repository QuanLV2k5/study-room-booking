import {
    MaterialCommunityIcons,
} from '@expo/vector-icons';

import {
    Tabs,
} from 'expo-router';

import { COLORS } from '@/constants/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor:
                    COLORS.primary,

                tabBarInactiveTintColor:
                    COLORS.textSecondary,

                tabBarStyle: {
                    height: 66,

                    paddingTop: 6,

                    paddingBottom: 7,

                    backgroundColor:
                        COLORS.white,

                    borderTopColor:
                        COLORS.border,
                },

                tabBarLabelStyle: {
                    fontSize: 11,

                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Phòng',

                    tabBarIcon: ({
                        color,
                        size,
                    }) => (
                        <MaterialCommunityIcons
                            name="door-open"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Lịch đặt',

                    tabBarIcon: ({
                        color,
                        size,
                    }) => (
                        <MaterialCommunityIcons
                            name="calendar-check"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Cá nhân',

                    tabBarIcon: ({
                        color,
                        size,
                    }) => (
                        <MaterialCommunityIcons
                            name="account"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}