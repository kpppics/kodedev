// ==========================================
// LOGIN SCREEN — Go Cosmo
// Dual mode: child (username+PIN) / parent (email+pw)
// ==========================================
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Cosmo from '../../components/mascot/Cosmo';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };
type LoginMode = 'child' | 'parent';

export default function LoginScreen({ navigation }: Props) {
  const { login, completeOnboarding } = useAuth();
  const [mode, setMode]                     = useState<LoginMode>('child');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [username, setUsername]             = useState('');
  const [pin, setPin]                       = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [loading, setLoading]               = useState(false);

  const handleLogin = async () => {
    const identifier = mode === 'child' ? username.trim() : email.trim();
    const secret     = mode === 'child' ? pin : password;
    if (!identifier || !secret) {
      Alert.alert(
        'Missing details',
        mode === 'child'
          ? 'Enter your username and PIN from your parent.'
          : 'Enter your email address and password.'
      );
      return;
    }
    setLoading(true);
    try {
      await login({ username: identifier, password: secret });
      await completeOnboarding();
    } catch (err: any) {
      Alert.alert(
        'Hmm, that didn\'t work 🤔',
        err?.message ?? 'Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Gradient hero */}
      <LinearGradient
        colors={['#2B0050', '#7B2FAE', '#FF3CAC']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <View style={[s.blob, { top: -30, right: -20, width: 130, height: 130 }]} />
        <View style={[s.blob, { bottom: -20, left: -20, width: 90, height: 90 }]} />

        <Cosmo mood={mode === 'child' ? 'waving' : 'happy'} size={90} animate />
        <Text style={s.appName}>Go Cosmo</Text>
        <Text style={s.tagline}>
          {mode === 'child'
            ? 'Ready to create something epic? 🚀'
            : 'Manage your child\'s learning journey 👨‍👩‍👧'}
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Mode toggle */}
        <View style={s.toggle}>
          {(['child', 'parent'] as LoginMode[]).map(m => (
            <TouchableOpacity
              key={m}
              style={[s.toggleBtn, mode === m && s.toggleBtnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[s.toggleText, mode === m && s.toggleTextActive]}>
                {m === 'child' ? '🧒 I\'m a kid' : '👨‍👩‍👧 Parent / Teacher'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.form}>

            {mode === 'child' ? (<>
              <Text style={s.label}>Your Username</Text>
              <View style={s.inputRow}>
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={s.input}
                  placeholder="e.g. coolkid123"
                  placeholderTextColor={COLORS.textLight}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <Text style={[s.label, { marginTop: SPACING.md }]}>Secret PIN (from your parent)</Text>
              <View style={s.inputRow}>
                <Ionicons name="keypad-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={s.input}
                  placeholder="4-digit PIN"
                  placeholderTextColor={COLORS.textLight}
                  value={pin}
                  onChangeText={t => setPin(t.replace(/\D/g, '').slice(0, 4))}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={4}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <View style={s.pinDots}>
                  {[0,1,2,3].map(i => (
                    <View key={i} style={[s.pinDot, pin.length > i && s.pinDotFilled]} />
                  ))}
                </View>
              </View>

              <View style={s.helpBox}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                <Text style={s.helpText}>Your parent set your PIN when they created your account</Text>
              </View>
            </>) : (<>
              <Text style={s.label}>Email Address</Text>
              <View style={s.inputRow}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={s.input}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <Text style={[s.label, { marginTop: SPACING.md }]}>Password</Text>
              <View style={s.inputRow}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="Your password"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={s.forgotLink}
                onPress={() => (navigation as any).navigate('ForgotPassword')}
              >
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </>)}

            {/* CTA */}
            <TouchableOpacity
              style={[s.loginBtn, loading && s.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['#FF3CAC', '#FF7043']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.loginBtnGradient}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.loginBtnText}>
                      {mode === 'child' ? '🚀 Let\'s Go!' : 'Log In'}
                    </Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.signupLink}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={s.signupText}>
                New here?{' '}
                <Text style={s.signupHighlight}>Create a free account</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  hero: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
  appName: { fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.black, color: '#fff', marginTop: SPACING.sm },
  tagline: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.85)', marginTop: 4, textAlign: 'center' },

  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.huge },

  toggle: { flexDirection: 'row', backgroundColor: '#F0E0F5', borderRadius: RADIUS.full, padding: 4, marginBottom: SPACING.xl },
  toggleBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#fff', ...SHADOWS.small },
  toggleText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textSecondary },
  toggleTextActive: { color: COLORS.primary },

  form: { gap: SPACING.xs },
  label: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textSecondary, marginBottom: 4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#fff', borderRadius: RADIUS.xl,
    borderWidth: 2, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...SHADOWS.small,
  },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, paddingVertical: SPACING.xs },
  pinDots: { flexDirection: 'row', gap: 6 },
  pinDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border },
  pinDotFilled: { backgroundColor: COLORS.primary },
  helpBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary + '12', borderRadius: RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.sm,
  },
  helpText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, flex: 1, lineHeight: 18 },
  forgotLink: { alignSelf: 'flex-end', paddingVertical: SPACING.sm },
  forgotText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: FONTS.weights.semibold },

  loginBtn: { borderRadius: RADIUS.full, overflow: 'hidden', marginTop: SPACING.xl, ...SHADOWS.medium },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnGradient: { paddingVertical: SPACING.lg, alignItems: 'center' },
  loginBtnText: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: '#fff' },

  signupLink: { alignSelf: 'center', paddingVertical: SPACING.md },
  signupText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  signupHighlight: { color: COLORS.primary, fontWeight: FONTS.weights.bold },
});
