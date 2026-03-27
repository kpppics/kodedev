import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { RootStackParamList, SubscriptionTier } from '../../types';
import { useAuth } from '../../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconColor,
  label,
  subtitle,
  onPress,
  rightElement,
  danger = false,
}) => (
  <TouchableOpacity
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
    style={styles.settingsRow}
  >
    <View style={[styles.settingsIconCircle, { backgroundColor: (iconColor ?? COLORS.primary) + '18' }]}>
      <Ionicons name={icon} size={20} color={iconColor ?? COLORS.primary} />
    </View>
    <View style={styles.settingsLabelContainer}>
      <Text style={[styles.settingsLabel, danger && styles.settingsLabelDanger]}>{label}</Text>
      {subtitle ? <Text style={styles.settingsSubtitle}>{subtitle}</Text> : null}
    </View>
    {rightElement ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} /> : null)}
  </TouchableOpacity>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();

  // Local toggle states (replace with real state management)
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakReminder, setStreakReminder] = useState(true);
  const [largeText, setLargeText] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);

  // Mock subscription
  const subscriptionTier: SubscriptionTier = 'junior';
  const screenTimeToday = 45; // minutes
  const screenTimeLimit = 60; // minutes

  const handleLogout = async () => {
    await logout();
    // AppNavigator automatically routes to AuthStack
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Page header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>Customize your experience</Text>
      </View>

      {/* ---- Account ---- */}
      <SectionHeader title="Account" />
      <View style={styles.card}>
        <SettingsRow
          icon="person-circle"
          label="Edit Profile"
          subtitle="Change name, avatar, and username"
          onPress={() => Alert.alert('Edit Profile 🎨', 'Display name changes coming soon! For now, your username is set when you create your account.', [{ text: 'Got it!' }])}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="key"
          label="Change Password"
          onPress={() => navigation.navigate('ForgotPassword')}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="mail"
          label="Email & Account"
          subtitle="Linked to parent account"
          onPress={() => Alert.alert('Email & Account 📧', 'Your account is managed by a parent. Ask your parent to update account details.', [{ text: 'OK' }])}
        />
      </View>

      {/* ---- Notifications ---- */}
      <SectionHeader title="Notifications" />
      <View style={styles.card}>
        <SettingsRow
          icon="notifications"
          iconColor={COLORS.warning}
          label="Push Notifications"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={notifications ? COLORS.primary : '#f4f3f4'}
            />
          }
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="sunny"
          iconColor={COLORS.xpGold}
          label="Daily Quest Reminder"
          subtitle="Get reminded to complete your quests"
          rightElement={
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={dailyReminder ? COLORS.primary : '#f4f3f4'}
            />
          }
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="flame"
          iconColor={COLORS.streak}
          label="Streak Reminder"
          subtitle="Don't lose your streak!"
          rightElement={
            <Switch
              value={streakReminder}
              onValueChange={setStreakReminder}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={streakReminder ? COLORS.primary : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* ---- Appearance ---- */}
      <SectionHeader title="Appearance" />
      <View style={styles.card}>
        <SettingsRow
          icon="moon"
          iconColor={COLORS.codeExplainer}
          label="Dark Mode"
          subtitle="Easier on the eyes at night"
          rightElement={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={darkMode ? COLORS.primary : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* ---- Accessibility ---- */}
      <SectionHeader title="Accessibility" />
      <View style={styles.card}>
        <SettingsRow
          icon="text"
          iconColor={COLORS.webBuilder}
          label="Large Text"
          subtitle="Make text bigger and easier to read"
          rightElement={
            <Switch
              value={largeText}
              onValueChange={setLargeText}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={largeText ? COLORS.primary : '#f4f3f4'}
            />
          }
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="eye"
          iconColor={COLORS.artFactory}
          label="Color Blind Mode"
          subtitle="Adjust colors for better visibility"
          rightElement={
            <Switch
              value={colorBlindMode}
              onValueChange={setColorBlindMode}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={colorBlindMode ? COLORS.primary : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* ---- Screen Time ---- */}
      <SectionHeader title="Screen Time" />
      <View style={styles.card}>
        <View style={styles.screenTimeSection}>
          <View style={styles.screenTimeHeader}>
            <Ionicons name="time" size={22} color={COLORS.primary} />
            <Text style={styles.screenTimeTitle}>Today's Usage</Text>
          </View>
          <View style={styles.screenTimeBarContainer}>
            <View style={styles.screenTimeBarBg}>
              <View
                style={[
                  styles.screenTimeBarFill,
                  {
                    width: `${Math.min((screenTimeToday / screenTimeLimit) * 100, 100)}%`,
                    backgroundColor:
                      screenTimeToday / screenTimeLimit > 0.8
                        ? COLORS.warning
                        : COLORS.success,
                  },
                ]}
              />
            </View>
            <Text style={styles.screenTimeText}>
              {screenTimeToday} / {screenTimeLimit} minutes
            </Text>
          </View>
        </View>
      </View>

      {/* ---- Subscription ---- */}
      <SectionHeader title="Subscription" />
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.subscriptionCard}
        onPress={() => navigation.navigate('Subscription')}
      >
        <View style={styles.subscriptionHeader}>
          <Ionicons name="diamond" size={24} color={COLORS.xpGold} />
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionTier}>
              {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan
            </Text>
            <Text style={styles.subscriptionStatus}>Active</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </View>
        <Text style={styles.subscriptionNote}>
          Tap to manage your subscription or upgrade
        </Text>
      </TouchableOpacity>

      {/* ---- About & Help ---- */}
      <SectionHeader title="About & Help" />
      <View style={styles.card}>
        <SettingsRow
          icon="help-circle"
          iconColor={COLORS.webBuilder}
          label="Help Center"
          subtitle="FAQs, tutorials, and support"
          onPress={() => Alert.alert('Help Center 🤖', 'Need help?\n\n• Talk to Cosmo — your AI buddy can answer most questions!\n• Email us: hello@gocosmo.ai\n• Visit: gocosmo.ai/help', [{ text: 'Got it!' }])}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="document-text"
          label="Terms of Service"
          onPress={() => Alert.alert('Terms of Service 📄', 'By using Go Cosmo, you agree to our Terms of Service. This app is designed for children aged 6-16 with parental consent.\n\nFull terms: gocosmo.ai/terms', [{ text: 'OK' }])}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="shield-checkmark"
          iconColor={COLORS.success}
          label="Privacy Policy"
          onPress={() => Alert.alert('Privacy Policy 🔒', 'Go Cosmo is COPPA compliant. We never sell your data, never show ads, and all AI interactions are strictly kid-safe.\n\nFull policy: gocosmo.ai/privacy', [{ text: 'OK' }])}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="information-circle"
          label="About Go Cosmo"
          subtitle="Version 1.0.0"
          onPress={() => Alert.alert('Go Cosmo 🚀', 'Go Cosmo v1.0.0\nThe AI learning adventure for kids aged 6-16!\n\nMade with ❤️ for curious young minds.', [{ text: 'Awesome!' }])}
        />
      </View>

      {/* ---- Logout ---- */}
      <TouchableOpacity activeOpacity={0.8} style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Promptcraft Academy v1.0.0</Text>
        <Text style={styles.footerText}>Made with love for young creators</Text>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.huge + SPACING.xxl,
  },

  // Header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.text,
  },
  headerSub: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Section headers
  sectionHeader: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
  },

  // Card wrapper
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },

  // Settings row
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },
  settingsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabelContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  settingsLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
  },
  settingsLabelDanger: {
    color: COLORS.error,
  },
  settingsSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.lg + 36 + SPACING.md,
  },

  // Screen time
  screenTimeSection: {
    padding: SPACING.lg,
  },
  screenTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  screenTimeTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  screenTimeBarContainer: {},
  screenTimeBarBg: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  screenTimeBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  screenTimeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Subscription
  subscriptionCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.xpGold + '40',
    ...SHADOWS.small,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  subscriptionTier: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  subscriptionStatus: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    fontWeight: FONTS.weights.semibold,
    marginTop: 2,
  },
  subscriptionNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '12',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  logoutText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  footerText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
