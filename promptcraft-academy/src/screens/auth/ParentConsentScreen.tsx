import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentConsent'>;

interface ConsentItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

const consentItems: ConsentItem[] = [
  {
    id: 'data_collection',
    title: 'Data Collection',
    description:
      'We collect your child\'s username, age, and learning progress to personalize their experience. We never collect real names or personal photos.',
    required: true,
  },
  {
    id: 'ai_interaction',
    title: 'AI Interaction',
    description:
      'Your child will interact with AI to create stories, art, and code. All AI responses are filtered for age-appropriate content.',
    required: true,
  },
  {
    id: 'progress_tracking',
    title: 'Progress & Analytics',
    description:
      'We track learning progress, XP, and achievements so you can review your child\'s activity in the Parent Dashboard.',
    required: true,
  },
  {
    id: 'community',
    title: 'Community Features',
    description:
      'Your child can share projects in a moderated gallery and participate in prompt battles. All content is reviewed for safety.',
    required: false,
  },
];

export default function ParentConsentScreen({ navigation }: Props) {
  const [parentEmail, setParentEmail] = useState('');
  const [childAge, setChildAge] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isParentConfirmed, setIsParentConfirmed] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [ageError, setAgeError] = useState('');

  const toggleConsent = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAge = (age: string): boolean => {
    const ageNum = parseInt(age, 10);
    return !isNaN(ageNum) && ageNum >= 4 && ageNum <= 17;
  };

  const allRequiredChecked = consentItems
    .filter((item) => item.required)
    .every((item) => checkedItems[item.id]);

  const canProceed =
    parentEmail.trim() !== '' &&
    childAge.trim() !== '' &&
    allRequiredChecked &&
    isParentConfirmed;

  const handleContinue = () => {
    let hasError = false;

    if (!validateEmail(parentEmail)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!validateAge(childAge)) {
      setAgeError('Please enter an age between 4 and 17');
      hasError = true;
    } else {
      setAgeError('');
    }

    if (hasError) return;

    if (!canProceed) {
      Alert.alert(
        'Required Items',
        'Please check all required consent items and confirm you are the parent or guardian.'
      );
      return;
    }

    navigation.navigate('Signup');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://promptcraft.academy/privacy');
  };

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerIcon}>
            <Text style={styles.headerEmoji}>🛡️</Text>
          </View>
          <Text style={styles.headerTitle}>Parent & Guardian Consent</Text>
          <Text style={styles.headerSubtitle}>
            We take your child's safety seriously. Please review how we handle data and give your
            consent below.
          </Text>
        </View>

        {/* COPPA Notice */}
        <View style={styles.coppaNotice}>
          <Ionicons name="information-circle" size={22} color={COLORS.primary} />
          <Text style={styles.coppaText}>
            Promptcraft Academy complies with COPPA (Children's Online Privacy Protection Act) and
            GDPR-K. We never sell children's data.
          </Text>
        </View>

        {/* Parent Email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parent/Guardian Email</Text>
          <Text style={styles.sectionDescription}>
            We'll send a verification email to confirm your identity.
          </Text>
          <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="parent@email.com"
              placeholderTextColor={COLORS.textLight}
              value={parentEmail}
              onChangeText={(text) => {
                setParentEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Child Age */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Child's Age</Text>
          <Text style={styles.sectionDescription}>
            We use this to provide age-appropriate content and features.
          </Text>
          <View style={[styles.inputContainer, styles.ageInput, ageError ? styles.inputError : null]}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Age (4-17)"
              placeholderTextColor={COLORS.textLight}
              value={childAge}
              onChangeText={(text) => {
                setChildAge(text.replace(/[^0-9]/g, ''));
                if (ageError) setAgeError('');
              }}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
          {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
        </View>

        {/* Consent Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Do With Data</Text>

          {consentItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.consentCard,
                checkedItems[item.id] ? styles.consentCardChecked : null,
              ]}
              onPress={() => toggleConsent(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.consentHeader}>
                <View
                  style={[
                    styles.checkbox,
                    checkedItems[item.id] ? styles.checkboxChecked : null,
                  ]}
                >
                  {checkedItems[item.id] && (
                    <Ionicons name="checkmark" size={16} color={COLORS.surface} />
                  )}
                </View>
                <View style={styles.consentTitleRow}>
                  <Text style={styles.consentTitle}>{item.title}</Text>
                  {item.required && <Text style={styles.requiredBadge}>Required</Text>}
                </View>
              </View>
              <Text style={styles.consentDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Parent Confirmation */}
        <TouchableOpacity
          style={[
            styles.parentConfirmation,
            isParentConfirmed ? styles.parentConfirmationChecked : null,
          ]}
          onPress={() => setIsParentConfirmed(!isParentConfirmed)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              styles.checkboxLarge,
              isParentConfirmed ? styles.checkboxChecked : null,
            ]}
          >
            {isParentConfirmed && (
              <Ionicons name="checkmark" size={18} color={COLORS.surface} />
            )}
          </View>
          <Text style={styles.parentConfirmationText}>
            I confirm that I am the parent or legal guardian of this child and I consent to the
            items checked above.
          </Text>
        </TouchableOpacity>

        {/* Privacy Policy Link */}
        <TouchableOpacity style={styles.privacyLink} onPress={handlePrivacyPolicy}>
          <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
          <Text style={styles.privacyLinkText}>Read our full Privacy Policy</Text>
          <Ionicons name="open-outline" size={16} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !canProceed ? styles.continueButtonDisabled : null]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!canProceed}
        >
          <Text style={styles.continueButtonText}>Continue to Sign Up</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.surface} />
        </TouchableOpacity>

        <Text style={styles.footerText}>
          You can revoke consent and delete your child's data at any time from the Parent Dashboard.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  header: {
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: SPACING.xxl,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 0,
    padding: SPACING.sm,
    zIndex: 1,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerEmoji: {
    fontSize: 36,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },
  coppaNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primaryLight + '15',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    gap: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  coppaText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
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
  ageInput: {
    width: 160,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  consentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  consentCardChecked: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '08',
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLarge: {
    width: 28,
    height: 28,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  consentTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  consentTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  requiredBadge: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '25',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  consentDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: 36,
  },
  parentConfirmation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SPACING.md,
    ...SHADOWS.small,
  },
  parentConfirmationChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  parentConfirmationText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    lineHeight: 22,
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
    paddingVertical: SPACING.sm,
  },
  privacyLinkText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  continueButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.surface,
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 20,
  },
});
