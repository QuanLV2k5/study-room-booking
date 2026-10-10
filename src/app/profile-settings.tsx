import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileSettingsForm from '@/components/ProfileSettingsForm';
import { COLORS } from '@/constants/theme';
import { useBookingHydrated } from '@/hooks/use-booking-hydrated';
import { useBookingStore } from '@/store/useBookingStore';

export default function ProfileSettingsScreen() {
  const hydrated = useBookingHydrated();
  const user = useBookingStore((state) => state.user);
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {hydrated ? <ProfileSettingsForm user={user} /> : (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: COLORS.textSecondary },
});
