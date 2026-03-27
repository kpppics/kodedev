// ==========================================
// FORGOT PASSWORD SCREEN — Go Cosmo
// Parent account password reset
// ==========================================
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';

type Step = 'email' | 'reset' | 'done';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [step, setStep]             = useState<Step>('email');
  const [email, setEmail]           = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);

  const handleSendReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim().toLowerCase());
      // In development the token is returned directly; in production it's emailed
      if ((res as any).resetToken) {
        setResetToken((res as any).resetToken);
        setStep('reset');
      } else {
        Alert.alert(
          'Check Your Email 📧',
          'If that email is registered, you\'ll receive a reset link shortly.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      Alert.alert('Oops!', err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert('Too Short', 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPw) {
      Alert.alert('No Match', 'Passwords don\'t match.');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(resetToken, newPassword);
      setStep('done');
    } catch (err: any) {
      Alert.alert('Oops!', err?.message ?? 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <LinearGradient colors={['#2B0050', '#7B2FAE', '#FF3CAC']} style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerEmoji}>
            {step === 'done' ? '🎉' : step === 'reset' ? '🔑' : '🔒'}
          </Text>
          <Text style={s.headerTitle}>
            {step === 'done' ? 'Password Reset!' : step === 'reset' ? 'New Password' : 'Forgot Password?'}
          </Text>
          <Text style={s.headerSub}>
            {step === 'done'
              ? 'Your password has been updated. You can now log in.'
              : step === 'reset'
              ? 'Choose a strong new password for your account.'
              : 'No worries! Enter your email and we\'ll get you back in.'}
          </Text>
        </LinearGradient>

        <View style={s.formWrap}>

          {/* ── Step: Email ── */}
          {step === 'email' && (
            <View style={s.form}>
              <Text style={s.label}>Parent Email Address</Text>
              <View style={s.inputWrap}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={handleSendReset}
                />
              </View>

              <TouchableOpacity
                style={[s.btn, loading && s.btnDisabled]}
                onPress={handleSendReset}
                disabled={loading}
                activeOpacity={0.88}
              >
                <LinearGradient colors={['#FF3CAC', '#FF7043']} style={s.btnGradient}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.btnText}>Send Reset Link</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={s.backLink} onPress={() => navigation.goBack()}>
                <Text style={s.backLinkText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step: New Password ── */}
          {step === 'reset' && (
            <View style={s.form}>
              <Text style={s.label}>New Password</Text>
              <View style={s.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="At least 8 characters"
                  placeholderTextColor={COLORS.textLight}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[s.label, { marginTop: SPACING.md }]}>Confirm Password</Text>
              <View style={s.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Repeat your password"
                  placeholderTextColor={COLORS.textLight}
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
              </View>

              {/* Strength indicators */}
              <View style={s.strengthRow}>
                {[
                  { ok: newPassword.length >= 8,          label: '8+ chars' },
                  { ok: /[A-Z]/.test(newPassword),        label: 'Uppercase' },
                  { ok: /[0-9]/.test(newPassword),        label: 'Number' },
                  { ok: newPassword === confirmPw && newPassword.length > 0, label: 'Match' },
                ].map(r => (
                  <View key={r.label} style={[s.strengthChip, r.ok && s.strengthChipOk]}>
                    <Ionicons name={r.ok ? 'checkmark' : 'close'} size={10} color={r.ok ? COLORS.success : COLORS.textLight} />
                    <Text style={[s.strengthLabel, r.ok && s.strengthLabelOk]}>{r.label}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[s.btn, loading && s.btnDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.88}
              >
                <LinearGradient colors={['#FF3CAC', '#FF7043']} style={s.btnGradient}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.btnText}>Set New Password</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step: Done ── */}
          {step === 'done' && (
            <View style={[s.form, { alignItems: 'center' }]}>
              <View style={s.successCircle}>
                <Ionicons name="checkmark" size={48} color={COLORS.success} />
              </View>
              <Text style={s.successTitle}>All done!</Text>
              <Text style={s.successText}>
                Your password has been successfully updated. Log in with your new password.
              </Text>
              <TouchableOpacity
                style={s.btn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.88}
              >
                <LinearGradient colors={['#FF3CAC', '#FF7043']} style={s.btnGradient}>
                  <Text style={s.btnText}>Back to Login</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1 },

  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: SPACING.lg,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerEmoji: { fontSize: 60, marginBottom: SPACING.md },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: '#fff', marginBottom: SPACING.sm },
  headerSub:   { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22 },

  formWrap: { padding: SPACING.xl },
  form:     { gap: SPACING.sm },
  label:    { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textSecondary },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: RADIUS.xl,
    borderWidth: 2, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm,
    ...SHADOWS.small,
  },
  inputIcon: { flexShrink: 0 },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, paddingVertical: SPACING.sm },

  strengthRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
  strengthChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.border, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  strengthChipOk: { backgroundColor: COLORS.success + '20' },
  strengthLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  strengthLabelOk: { color: COLORS.success, fontWeight: FONTS.weights.semibold },

  btn: { borderRadius: RADIUS.full, overflow: 'hidden', marginTop: SPACING.md, ...SHADOWS.medium },
  btnDisabled: { opacity: 0.6 },
  btnGradient: { paddingVertical: SPACING.lg, alignItems: 'center', borderRadius: RADIUS.full },
  btnText: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.black, color: '#fff' },

  backLink: { alignSelf: 'center', paddingVertical: SPACING.sm },
  backLinkText: { fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: FONTS.weights.semibold },

  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.success + '15', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  successTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.sm },
  successText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
});
