import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/theme';
import { useBookingStore } from '@/store/useBookingStore';
import { selectImageBookingQR, validateBookingQR } from '@/utils/check-in';
import { cancelCheckInReminder } from '@/utils/notifications';

type ScanPhase = 'idle' | 'picking' | 'reading' | 'checking' | 'paused';
interface ScanFeedback { title: string; message: string; completed: boolean }
const scannerSettings = { barcodeTypes: ['qr' as const] };
const busyLabels = { picking: 'Đang chọn ảnh...', reading: 'Đang đọc mã QR...', checking: 'Đang check-in...' };

function ScannerActions({ phase, feedback, onSelectImage, onReset, onFinish, light = false }: {
  phase: ScanPhase;
  feedback: ScanFeedback | null;
  onSelectImage: () => void;
  onReset: () => void;
  onFinish: () => void;
  light?: boolean;
}) {
  const busy = phase === 'picking' || phase === 'reading' || phase === 'checking';
  const label = busy ? busyLabels[phase] : 'Chọn ảnh từ thư viện';
  return (
    <View style={styles.actions}>
      {feedback && (
        <View style={styles.feedback} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Text style={[styles.feedbackTitle, { color: feedback.completed ? COLORS.success : COLORS.danger }]}>
            {feedback.title}
          </Text>
          <Text style={styles.feedbackMessage}>{feedback.message}</Text>
        </View>
      )}
      {phase === 'paused' && (
        <TouchableOpacity style={styles.secondaryButton} accessibilityRole="button"
          onPress={feedback?.completed ? onFinish : onReset}>
          <Text style={styles.secondaryButtonText}>{feedback?.completed ? 'Hoàn tất' : 'Quét lại'}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.galleryButton, (busy || feedback?.completed) && styles.disabledButton]}
        disabled={busy || feedback?.completed === true}
        accessibilityRole="button" accessibilityLabel={label}
        accessibilityState={{ disabled: busy || feedback?.completed === true, busy }}
        onPress={onSelectImage}
      >
        {busy ? <ActivityIndicator color={COLORS.white} /> :
          <MaterialCommunityIcons name="image-multiple-outline" size={22} color={COLORS.white} />}
        <Text style={styles.galleryButtonText}>{label}</Text>
      </TouchableOpacity>
      <Text style={[styles.hint, light && styles.lightHint]}>Chọn ảnh hoặc ảnh chụp màn hình có QR Booking Pass</Text>
    </View>
  );
}

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  // Ref locks take effect immediately, before React renders disabled controls.
  const busyRef = useRef(false);
  const pausedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const finish = useCallback(() => router.back(), []);
  const resetScan = useCallback(() => {
    pausedRef.current = false;
    setFeedback(null);
    setPhase('idle');
  }, []);

  const showResult = useCallback((title: string, message: string, completed = false) => {
    if (!mountedRef.current) return;
    pausedRef.current = true;
    setFeedback({ title, message, completed });
    setPhase('paused');
    if (Platform.OS !== 'web') {
      Alert.alert(title, message, [{
        text: completed ? 'Hoàn tất' : 'Quét lại', onPress: completed ? finish : resetScan,
      }], { cancelable: false });
    }
  }, [finish, resetScan]);

  const processQR = useCallback(async (data: string) => {
    if (!mountedRef.current) return;
    setPhase('checking');
    // Read the latest store, including any booking changed while the picker was open.
    const state = useBookingStore.getState();
    const result = validateBookingQR(data, state.bookings);
    if (result.status !== 'ready') {
      showResult(result.title, result.message, result.status === 'already-checked-in');
      return;
    }
    state.checkIn(result.booking.id);
    try {
      await cancelCheckInReminder(result.booking.notificationId);
    } catch (error) {
      console.warn('Không thể hủy reminder sau check-in:', error);
    }
    showResult('Check-in thành công', `Mã ${result.booking.passCode} đã được xác nhận.`, true);
  }, [showResult]);

  const handleBarcodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (busyRef.current || pausedRef.current) return;
    busyRef.current = true;
    pausedRef.current = true;
    try {
      await processQR(data);
    } catch {
      showResult('Không thể check-in', 'Vui lòng thử quét lại Booking Pass.');
    } finally {
      busyRef.current = false;
    }
  }, [processQR, showResult]);

  const selectImage = useCallback(async () => {
    if (busyRef.current || feedback?.completed) return;
    busyRef.current = true;
    pausedRef.current = true;
    setFeedback(null);
    setPhase('picking');
    try {
      // The system photo picker does not require camera or full-library access.
      // Launch directly from the press event, also required by mobile browsers.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: false, allowsMultipleSelection: false,
        quality: 1,
        preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });
      if (!mountedRef.current) return;
      if (result.canceled) {
        resetScan();
        return;
      }
      const uri = result.assets[0]?.uri;
      if (!uri) throw new Error('Missing selected image');
      setPhase('reading');
      const codes = await scanFromURLAsync(uri, ['qr']);
      if (!mountedRef.current) return;
      const selected = selectImageBookingQR(codes);
      if (selected.status === 'empty') {
        showResult('Không tìm thấy mã QR', 'Hãy chọn ảnh rõ nét, có mã QR đủ lớn và không bị che hoặc cắt mất.');
      } else if (selected.status === 'ambiguous') {
        showResult('Ảnh có nhiều Booking Pass', 'Vui lòng chọn ảnh chỉ chứa một Booking Pass để check-in đúng phòng.');
      } else if (selected.status === 'invalid') {
        showResult('QR không hợp lệ', 'Mã QR trong ảnh không phải Booking Pass của StudyRoom.');
      } else if (selected.status === 'selected') {
        await processQR(selected.data);
      }
    } catch (error) {
      console.warn('Không thể chọn hoặc đọc ảnh QR:', error);
      showResult('Không thể đọc ảnh', 'Vui lòng thử lại hoặc chọn ảnh JPG/PNG rõ nét chứa QR Booking Pass.');
    } finally {
      busyRef.current = false;
    }
  }, [feedback?.completed, processQR, resetScan, showResult]);

  const actions = <ScannerActions phase={phase} feedback={feedback} onSelectImage={selectImage}
    onReset={resetScan} onFinish={finish} light={!permission?.granted} />;

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.permissionContent}>
          <View style={styles.permissionCard}>
            <MaterialCommunityIcons name="qrcode-scan" size={52} color={COLORS.primary} />
            <Text style={styles.permissionTitle}>{permission ? 'Quét Booking Pass' : 'Đang kiểm tra quyền camera...'}</Text>
            <Text style={styles.permissionDescription}>
              Cho phép camera để quét trực tiếp, hoặc chọn ảnh Booking Pass từ thư viện để check-in.
            </Text>
            {permission && <TouchableOpacity style={styles.permissionButton} accessibilityRole="button"
              onPress={() => { void requestPermission(); }}>
              <Text style={styles.secondaryButtonText}>Cho phép camera</Text>
            </TouchableOpacity>}
            {actions}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={scannerSettings}
        onBarcodeScanned={phase === 'idle' ? handleBarcodeScanned : undefined} />
      <ScrollView contentContainerStyle={styles.overlay}>
        <View style={styles.topContent}>
          <Text style={styles.title}>Quét Booking Pass</Text>
          <Text style={styles.description}>Đưa mã QR vào giữa khung hình hoặc chọn ảnh</Text>
        </View>
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        {actions}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  permissionContainer: { flex: 1, backgroundColor: COLORS.background },
  permissionContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  permissionCard: { padding: 24, alignItems: 'center', borderRadius: 22, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border },
  permissionTitle: { marginTop: 14, fontSize: 21, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  permissionDescription: { marginTop: 8, marginBottom: 22, fontSize: 14, lineHeight: 20,
    textAlign: 'center', color: COLORS.textSecondary },
  permissionButton: { width: '100%', paddingVertical: 15, alignItems: 'center', borderRadius: 14,
    backgroundColor: COLORS.primaryLight, marginBottom: 12 },
  overlay: { flexGrow: 1, alignItems: 'center', justifyContent: 'space-between', gap: 24,
    paddingTop: 32, paddingBottom: 32, paddingHorizontal: 24, backgroundColor: 'rgba(0,0,0,0.28)' },
  topContent: { alignItems: 'center' },
  title: { fontSize: 25, fontWeight: '800', color: COLORS.white },
  description: { marginTop: 7, fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  scannerFrame: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: 46, height: 46, borderColor: COLORS.white },
  topLeft: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 15 },
  topRight: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 15 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 15 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 15 },
  actions: { width: '100%', gap: 12, alignItems: 'center' },
  galleryButton: { width: '100%', flexDirection: 'row', gap: 10, paddingHorizontal: 14,
    paddingVertical: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: COLORS.primary },
  galleryButtonText: { flexShrink: 1, color: COLORS.white, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  disabledButton: { opacity: 0.65 },
  hint: { color: COLORS.white, fontSize: 12, textAlign: 'center' },
  lightHint: { color: COLORS.textSecondary },
  feedback: { width: '100%', padding: 16, borderRadius: 14, backgroundColor: COLORS.white },
  feedbackTitle: { fontSize: 16, fontWeight: '700' },
  feedbackMessage: { marginTop: 6, fontSize: 14, lineHeight: 20, color: COLORS.textSecondary },
  secondaryButton: { width: '100%', paddingVertical: 13, alignItems: 'center', borderRadius: 14,
    backgroundColor: COLORS.primaryLight },
  secondaryButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
});
