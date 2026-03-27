import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

type Step = 'parent' | 'child';

const AVATARS = [
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐱', label: 'Cat' },
  { emoji: '🦄', label: 'Unicorn' },
  { emoji: '🐼', label: 'Panda' },
  { emoji: '🐸', label: 'Frog' },
  { emoji: '🦉', label: 'Owl' },
  { emoji: '🐶', label: 'Dog' },
  { emoji: '🐰', label: 'Bunny' },
  { emoji: '🦁', label: 'Lion' },
  { emoji: '🐧', label: 'Penguin' },
  { emoji: '🐙', label: 'Octopus' },
  { emoji: '🦋', label: 'Butterfly' },
  { emoji: '🐝', label: 'Bee' },
  { emoji: '🦖', label: 'Dino' },
  { emoji: '🐳', label: 'Whale' },
  { emoji: '🦜', label: 'Parrot' },
];

const USERNAME_SUGGESTIONS = [
  'StarCoder',
  'PixelWizard',
  'CloudDreamer',
  'RocketBuilder',
  'SparkMaker',
  'NeonNinja',
  'CosmicCat',
  'TurboTiger',
];

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

function getPasswordStrength(password: string): { strength: PasswordStrength; score: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { strength: 'weak', score: 1 };
  if (score === 2) return { strength: 'fair', score: 2 };
  if (score === 3) return { strength: 'good', score: 3 };
  return { strength: 'strong', score: 4 };
}

const strengthColors: Record<PasswordStrength, string> = {
  weak: COLORS.error,
  fair: COLORS.warning,
  good: COLORS.xpGold,
  strong: COLORS.success,
};

const strengthLabels: Record<PasswordStrength, string> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

export default function SignupScreen({ navigation }: Props) {
  const { signup, completeOnboarding } = useAuth();
  const [step, setStep] = useState<Step>('parent');

  // Parent account fields
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [parentPin, setParentPin] = useState('');

  // Child profile fields
  const [childUsername, setChildUsername] = useState('');
  const [childAge, setChildAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateParent = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!parentName.trim()) {
      newErrors.parentName = 'Please enter your name';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      newErrors.parentEmail = 'Please enter a valid email address';
    }

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (parentPin.length !== 4 || !/^\d{4}$/.test(parentPin)) {
      newErrors.parentPin = 'PIN must be exactly 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateChild = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!childUsername.trim()) {
      newErrors.childUsername = 'Please choose a username';
    } else if (childUsername.length < 3) {
      newErrors.childUsername = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(childUsername)) {
      newErrors.childUsername = 'Only letters, numbers, and underscores allowed';
    }

    const ageNum = parseInt(childAge, 10);
    if (isNaN(ageNum) || ageNum < 4 || ageNum > 17) {
      newErrors.childAge = 'Please enter an age between 4 and 17';
    }

    if (!selectedAvatar) {
      newErrors.avatar = 'Please choose an avatar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleParentContinue = () => {
    if (validateParent()) {
      setStep('child');
    }
  };

  const handleCreateAccount = async () => {
    if (!validateChild()) return;
    try {
      await signup({
        username: childUsername,
        displayName: childUsername,
        age: parseInt(childAge, 10),
        role: 'child',
        avatar: selectedAvatar,
        parentEmail,
      });
      await completeOnboarding();
      // AppNavigator automatically switches to MainStack once authenticated + onboarded
    } catch {
      Alert.alert('Error', 'Could not create account. Please try again.');
    }
  };

  const handleUseSuggestion = (suggestion: string) => {
    setChildUsername(suggestion);
    if (errors.childUsername) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.childUsername;
        return next;
      });
    }
  };

  const passwordInfo = password ? getPasswordStrength(password) : null;

  const renderParentStep = () => (
    <>
      {/* Header */}
      <View style={styles.stepHeader}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step 1 of 2</Text>
        </View>
        <Text style={styles.stepTitle}>Create Parent Account</Text>
        <Text style={styles.stepSubtitle}>
          Set up your account first so you can manage your child's experience.
        </Text>
      </View>

      {/* Parent Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Your Name</Text>
        <View style={[styles.inputContainer, errors.parentName ? styles.inputError : null]}>
          <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={COLORS.textLight}
            value={parentName}
            onChangeText={(text) => {
              setParentName(text);
              if (errors.parentName) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.parentName;
                  return next;
                });
              }
            }}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
        {errors.parentName ? <Text style={styles.errorText}>{errors.parentName}</Text> : null}
      </View>

      {/* Parent Email */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Email Address</Text>
        <View style={[styles.inputContainer, errors.parentEmail ? styles.inputError : null]}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="parent@email.com"
            placeholderTextColor={COLORS.textLight}
            value={parentEmail}
            onChangeText={(text) => {
              setParentEmail(text);
              if (errors.parentEmail) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.parentEmail;
                  return next;
                });
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {errors.parentEmail ? <Text style={styles.errorText}>{errors.parentEmail}</Text> : null}
      </View>

      {/* Password */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Password</Text>
        <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Minimum 8 characters"
            placeholderTextColor={COLORS.textLight}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
              }
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        {/* Password Strength Indicator */}
        {passwordInfo && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBars}>
              {[1, 2, 3, 4].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        level <= passwordInfo.score
                          ? strengthColors[passwordInfo.strength]
                          : COLORS.border,
                    },
                  ]}
                />
              ))}
            </View>
            <Text
              style={[styles.strengthLabel, { color: strengthColors[passwordInfo.strength] }]}
            >
              {strengthLabels[passwordInfo.strength]}
            </Text>
          </View>
        )}
      </View>

      {/* Confirm Password */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Confirm Password</Text>
        <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor={COLORS.textLight}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.confirmPassword;
                  return next;
                });
              }
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword ? (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        ) : null}
      </View>

      {/* Parent PIN */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Parent PIN</Text>
        <Text style={styles.fieldHint}>
          Your child will use this PIN along with their username to log in.
        </Text>
        <View style={[styles.inputContainer, styles.pinInput, errors.parentPin ? styles.inputError : null]}>
          <Ionicons name="keypad-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="4-digit PIN"
            placeholderTextColor={COLORS.textLight}
            value={parentPin}
            onChangeText={(text) => {
              setParentPin(text.replace(/[^0-9]/g, ''));
              if (errors.parentPin) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.parentPin;
                  return next;
                });
              }
            }}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </View>
        {errors.parentPin ? <Text style={styles.errorText}>{errors.parentPin}</Text> : null}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleParentContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.surface} />
      </TouchableOpacity>

      {/* Login Link */}
      <View style={styles.loginLinkContainer}>
        <Text style={styles.loginLinkText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLinkAction}>Log In</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderChildStep = () => (
    <>
      {/* Header */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepBadge, { backgroundColor: COLORS.success + '20' }]}>
          <Text style={[styles.stepBadgeText, { color: COLORS.success }]}>Step 2 of 2</Text>
        </View>
        <Text style={styles.stepTitle}>Create Child Profile</Text>
        <Text style={styles.stepSubtitle}>
          Now let's set up your child's fun profile for their learning adventure!
        </Text>
      </View>

      {/* Avatar Selection */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Choose an Avatar</Text>
        {errors.avatar ? <Text style={styles.errorText}>{errors.avatar}</Text> : null}
        <View style={styles.avatarGrid}>
          {AVATARS.map((avatar) => (
            <TouchableOpacity
              key={avatar.emoji}
              style={[
                styles.avatarItem,
                selectedAvatar === avatar.emoji ? styles.avatarItemSelected : null,
              ]}
              onPress={() => {
                setSelectedAvatar(avatar.emoji);
                if (errors.avatar) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.avatar;
                    return next;
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
              {selectedAvatar === avatar.emoji && (
                <View style={styles.avatarCheck}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Username */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Username</Text>
        <Text style={styles.fieldHint}>This is what other kids will see. No real names!</Text>
        <View style={[styles.inputContainer, errors.childUsername ? styles.inputError : null]}>
          <Ionicons name="at-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Choose a fun username"
            placeholderTextColor={COLORS.textLight}
            value={childUsername}
            onChangeText={(text) => {
              setChildUsername(text.replace(/\s/g, ''));
              if (errors.childUsername) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.childUsername;
                  return next;
                });
              }
            }}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
        </View>
        {errors.childUsername ? (
          <Text style={styles.errorText}>{errors.childUsername}</Text>
        ) : null}

        {/* Username Suggestions */}
        <Text style={styles.suggestionsLabel}>Try one of these:</Text>
        <View style={styles.suggestionsGrid}>
          {USERNAME_SUGGESTIONS.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={[
                styles.suggestionChip,
                childUsername === suggestion ? styles.suggestionChipSelected : null,
              ]}
              onPress={() => handleUseSuggestion(suggestion)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.suggestionText,
                  childUsername === suggestion ? styles.suggestionTextSelected : null,
                ]}
              >
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Child Age */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Age</Text>
        <View style={[styles.inputContainer, styles.ageInput, errors.childAge ? styles.inputError : null]}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Age (4-17)"
            placeholderTextColor={COLORS.textLight}
            value={childAge}
            onChangeText={(text) => {
              setChildAge(text.replace(/[^0-9]/g, ''));
              if (errors.childAge) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.childAge;
                  return next;
                });
              }
            }}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        {errors.childAge ? <Text style={styles.errorText}>{errors.childAge}</Text> : null}
      </View>

      {/* Preview Card */}
      {(selectedAvatar || childUsername) && (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Profile Preview</Text>
          <View style={styles.previewContent}>
            <View style={styles.previewAvatar}>
              <Text style={styles.previewAvatarEmoji}>
                {selectedAvatar || '?'}
              </Text>
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewUsername}>
                {childUsername || 'Username'}
              </Text>
              <View style={styles.previewBadges}>
                <View style={styles.previewXpBadge}>
                  <Ionicons name="star" size={12} color={COLORS.xpGold} />
                  <Text style={styles.previewXpText}>Level 1</Text>
                </View>
                <View style={styles.previewXpBadge}>
                  <Ionicons name="flash" size={12} color={COLORS.streak} />
                  <Text style={styles.previewXpText}>0 XP</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.childButtons}>
        <TouchableOpacity
          style={styles.backStepButton}
          onPress={() => setStep('parent')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          <Text style={styles.backStepText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, styles.createButton]}
          onPress={handleCreateAccount}
          activeOpacity={0.8}
        >
          <Ionicons name="rocket-outline" size={20} color={COLORS.surface} />
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topBackButton}
            onPress={() => {
              if (step === 'child') {
                setStep('parent');
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[styles.progressLine, step === 'child' ? styles.progressLineActive : null]} />
            <View style={[styles.progressDot, step === 'child' ? styles.progressDotActive : null]} />
          </View>

          <View style={styles.topBackButton} />
        </View>

        {/* Logo Area */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>
            {step === 'parent' ? '👋' : '🎨'}
          </Text>
        </View>

        {step === 'parent' ? renderParentStep() : renderChildStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const AVATAR_ITEM_SIZE = (width - SPACING.xl * 2 - SPACING.sm * 3) / 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.huge,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    marginBottom: SPACING.lg,
  },
  topBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  progressLine: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoEmoji: {
    fontSize: 48,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  stepBadge: {
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  stepBadgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  stepTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },
  fieldGroup: {
    marginBottom: SPACING.xl,
  },
  fieldLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  fieldHint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.small,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  pinInput: {
    width: 180,
  },
  ageInput: {
    width: 160,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  strengthBars: {
    flexDirection: 'row',
    flex: 1,
    gap: SPACING.xs,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    minWidth: 48,
    textAlign: 'right',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.sm,
    marginTop: SPACING.md,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.surface,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  loginLinkText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  loginLinkAction: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  avatarItem: {
    width: AVATAR_ITEM_SIZE,
    height: AVATAR_ITEM_SIZE,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  avatarItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '15',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  avatarCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
  },
  suggestionsLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  suggestionChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '15',
  },
  suggestionText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  suggestionTextSelected: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight + '40',
    ...SHADOWS.medium,
  },
  previewTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  previewAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewAvatarEmoji: {
    fontSize: 36,
  },
  previewInfo: {
    flex: 1,
  },
  previewUsername: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  previewBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  previewXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  previewXpText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  childButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  backStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: SPACING.xs,
  },
  backStepText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  createButton: {
    flex: 1,
    backgroundColor: COLORS.success,
  },
});
