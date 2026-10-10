import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import type { TextInputProps } from 'react-native';
import { router } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { COLORS } from '@/constants/theme';
import { useBookingStore } from '@/store/useBookingStore';
import type { UserSession } from '@/types';
import { getProfileFields, validateProfile } from '@/utils/profile';
import type { ProfileErrors, ProfileFields } from '@/utils/profile';

function ProfileInput({ label, error, optional, inputRef, ...props }: TextInputProps & {
  label: string; error?: string; optional?: boolean; inputRef?: RefObject<TextInput | null>;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{optional ? ' (tùy chọn)' : ' *'}</Text>
      <TextInput {...props} ref={inputRef} accessibilityLabel={label}
        style={[styles.input, error && styles.inputError]} placeholderTextColor={COLORS.textSecondary} />
      {error && <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>}
    </View>
  );
}

export default function ProfileSettingsForm({ user }: { user: UserSession }) {
  const headerHeight = useHeaderHeight();
  const [fields, setFields] = useState(() => getProfileFields(user));
  const [savedFields, setSavedFields] = useState(() => getProfileFields(user));
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ success: boolean; text: string } | null>(null);
  const savingRef = useRef(false);
  const mountedRef = useRef(true);
  const studentIdInput = useRef<TextInput>(null);
  const emailInput = useRef<TextInput>(null);
  const phoneInput = useRef<TextInput>(null);
  const hasChanges = (Object.keys(fields) as (keyof ProfileFields)[])
    .some((key) => fields[key] !== savedFields[key]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const updateField = useCallback((key: keyof ProfileFields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setNotice(null);
  }, []);

  const save = useCallback(async () => {
    if (savingRef.current || !hasChanges) return;
    const result = validateProfile(fields);
    if (!result.valid) {
      setErrors(result.errors);
      setNotice({ success: false, text: 'Vui lòng kiểm tra các thông tin bên dưới.' });
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setErrors({});
    setNotice(null);
    try {
      const state = useBookingStore.getState();
      await state.setUser({
        ...state.user,
        name: result.fields.name,
        studentId: result.fields.studentId,
        email: result.fields.email || undefined,
        phone: result.fields.phone || undefined,
      });
      if (!mountedRef.current) return;
      setFields(result.fields);
      setSavedFields(result.fields);
      setNotice({ success: true, text: 'Đã lưu thông tin cá nhân.' });
    } catch {
      if (mountedRef.current) setNotice({ success: false, text: 'Không thể lưu thông tin. Vui lòng thử lại.' });
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }, [fields, hasChanges]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  return (
    <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={headerHeight}
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <Text style={styles.subtitle}>Cập nhật thông tin để hồ sơ của bạn luôn chính xác.</Text>
        <View style={styles.card}>
          <ProfileInput label="Họ và tên" value={fields.name} error={errors.name} maxLength={80}
            editable={!saving} autoCapitalize="words" autoComplete="name" returnKeyType="next"
            placeholder="Nhập họ và tên" submitBehavior="submit"
            onSubmitEditing={() => studentIdInput.current?.focus()}
            onChangeText={(value) => updateField('name', value)} />
          <ProfileInput label="MSSV" value={fields.studentId} error={errors.studentId} maxLength={20}
            editable={!saving} inputRef={studentIdInput} autoCapitalize="characters" autoCorrect={false}
            placeholder="Ví dụ: 23IT000" returnKeyType="next" submitBehavior="submit"
            onSubmitEditing={() => emailInput.current?.focus()}
            onChangeText={(value) => updateField('studentId', value)} />
          <ProfileInput label="Email" optional value={fields.email} error={errors.email} maxLength={254}
            editable={!saving} inputRef={emailInput} keyboardType="email-address" autoComplete="email"
            autoCapitalize="none" autoCorrect={false} placeholder="Nhập địa chỉ email"
            returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => phoneInput.current?.focus()}
            onChangeText={(value) => updateField('email', value)} />
          <ProfileInput label="Số điện thoại" optional value={fields.phone} error={errors.phone} maxLength={30}
            editable={!saving} inputRef={phoneInput} keyboardType="phone-pad" autoComplete="tel"
            placeholder="Ví dụ: 0987654321" returnKeyType="done" onSubmitEditing={() => { void save(); }}
            onChangeText={(value) => updateField('phone', value)} />
          <Text style={styles.requiredNote}>* Thông tin bắt buộc</Text>
        </View>
        {notice && <View style={[styles.notice, notice.success ? styles.successNotice : styles.errorNotice]}
          accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Text style={[styles.noticeText, { color: notice.success ? COLORS.success : COLORS.danger }]}>{notice.text}</Text>
        </View>}
        <TouchableOpacity style={[styles.saveButton, (!hasChanges || saving) && styles.disabledButton]}
          disabled={!hasChanges || saving} accessibilityRole="button"
          accessibilityState={{ disabled: !hasChanges || saving, busy: saving }} onPress={() => { void save(); }}>
          {saving && <ActivityIndicator color={COLORS.white} />}
          <Text style={styles.saveText}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} disabled={saving} accessibilityRole="button"
          accessibilityState={{ disabled: saving }} onPress={goBack}>
          <Text style={styles.cancelText}>{hasChanges ? 'Hủy' : 'Quay về hồ sơ'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle: { marginTop: 6, fontSize: 14, lineHeight: 20, color: COLORS.textSecondary },
  card: { marginTop: 24, padding: 20, borderRadius: 18, borderWidth: 1,
    borderColor: COLORS.border, backgroundColor: COLORS.white },
  field: { marginBottom: 18 },
  label: { marginBottom: 8, fontSize: 14, fontWeight: '600', color: COLORS.text },
  input: { paddingHorizontal: 14, paddingVertical: 13, minHeight: 48, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 12, fontSize: 16, color: COLORS.text, backgroundColor: COLORS.background },
  inputError: { borderColor: COLORS.danger },
  errorText: { marginTop: 6, fontSize: 12, lineHeight: 18, color: COLORS.danger },
  requiredNote: { fontSize: 12, color: COLORS.textSecondary },
  notice: { marginTop: 16, padding: 14, borderRadius: 12 },
  successNotice: { backgroundColor: COLORS.successLight },
  errorNotice: { backgroundColor: COLORS.dangerLight },
  noticeText: { fontSize: 14, lineHeight: 20 },
  saveButton: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15, borderRadius: 14, backgroundColor: COLORS.primary },
  saveText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  disabledButton: { opacity: 0.5 },
  cancelButton: { marginTop: 10, paddingVertical: 15, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
});
