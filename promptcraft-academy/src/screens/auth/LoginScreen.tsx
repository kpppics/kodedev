import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

type LoginMode = 'parent' | 'child';

export default function LoginScreen({ navigation }: Props) {
  const { login, completeOnboarding } = useAuth();
  const [mode, setMode] = useState<LoginMode>('child');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [parentPin, setParentPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const identifier = mode === 'child' ? username.trim() : email.trim();
    const secret = mode === 'child' ? parentPin : password;
    if (!identifier || !secret) {
      Alert.alert('Missing details', mode === 'child' ? 'Enter your username and PIN.' : 'Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login({ username: identifier, password: secret });
      await completeOnboarding();
      // AppNavigator automatically routes to MainStack
    } catch {
      Alert.alert('Oops!', 'Could not log in. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
          <Text style={styles.appName}>PromptCraft</Text>
          <Text style={styles.tagline}>Learn to talk to AI</Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'child' && styles.toggleActive]}
            onPress={() => setMode('child')}
          >
            <Text style={[styles.toggleText, mode === 'child' && styles.toggleActiveText]}>
              🧒 I'm a kid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'parent' && styles.toggleActive]}
            onPress={() => setMode('parent')}
          >
            <Text style={[styles.toggleText, mode === 'parent' && styles.toggleActiveText]}>
              👨‍👩‍👧 Parent / Teacher
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === 'child' ? (
            <>
              <Text style={styles.label}>Your username</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="coolkid123"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.label}>Parent's secret PIN</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ask your parent"
                  value={parentPin}
                  onChangeText={setParentPin}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="parent@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotLink}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>
                {mode === 'child' ? '🚀 Lets go!' : 'Log in'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupText}>
              New here?{' '}
              <Text style={styles.signupHighlight}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: SPACING.xl, justifyContent: 'center' },
  logoArea: { alignItems: 'center', marginBottom: SPACING.xxl },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  logoEmoji: { fontSize: 44 },
  appName: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  tagline: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: 4 },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: SPACING.xxl,
  },
  toggleBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, alignItems: 'center' },
  toggleActive: { backgroundColor: COLORS.primary, ...SHADOWS.small },
  toggleText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary },
  toggleActiveText: { color: '#fff', fontWeight: FONTS.weights.bold },
  form: { gap: SPACING.sm },
  label: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.textSecondary, marginBottom: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 50,
    ...SHADOWS.small,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
  forgotLink: { alignSelf: 'flex-end', marginBottom: SPACING.md },
  forgotText: { fontSize: FONTS.sizes.sm, color: COLORS.primary },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.medium,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: '#fff' },
  signupLink: { alignItems: 'center', marginTop: SPACING.lg },
  signupText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  signupHighlight: { color: COLORS.primary, fontWeight: FONTS.weights.semibold },
});
