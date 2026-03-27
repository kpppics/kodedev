// ==========================================
// PROMPTCRAFT ACADEMY - App Navigator
// ==========================================

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList, MainTabParamList } from '../types';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// ---- Existing Screens ----
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import ParentConsentScreen from '../screens/auth/ParentConsentScreen';
import RealSignupScreen from '../screens/auth/SignupScreen';
import HomeScreen from '../screens/home/HomeScreen';
import TracksScreen from '../screens/home/TracksScreen';

// ==========================================
// Placeholder Screens
// ==========================================
// These are used for screens that haven't been built yet.
// Each one renders a colorful placeholder with the screen name.

function makePlaceholder(name: string, icon: keyof typeof Ionicons.glyphMap, color: string) {
  return function PlaceholderScreen() {
    return (
      <View style={[placeholderStyles.container, { backgroundColor: COLORS.background }]}>
        <View style={[placeholderStyles.iconCircle, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={48} color={color} />
        </View>
        <Text style={placeholderStyles.title}>{name}</Text>
        <Text style={placeholderStyles.subtitle}>Coming soon!</Text>
      </View>
    );
  };
}

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
  },
});

// ---- Placeholder screen components ----
const SignupScreen = RealSignupScreen;
const LoginScreen = makePlaceholder('Log In', 'log-in', COLORS.primary);
const CreateScreen = makePlaceholder('Create', 'add-circle', COLORS.artFactory);
const BattlesScreen = makePlaceholder('Prompt Battles', 'trophy', COLORS.xpGold);
const ProfileScreen = makePlaceholder('Profile', 'person-circle', COLORS.primaryLight);
const TrackDetailScreen = makePlaceholder('Track Detail', 'book', COLORS.webBuilder);
const LessonScreen = makePlaceholder('Lesson', 'school', COLORS.storyStudio);
const ProjectViewScreen = makePlaceholder('Project', 'document', COLORS.artFactory);
const ParentDashboardScreen = makePlaceholder('Parent Dashboard', 'shield-checkmark', COLORS.success);
const SettingsScreen = makePlaceholder('Settings', 'settings', COLORS.textSecondary);
const SubscriptionScreen = makePlaceholder('Subscription', 'star', COLORS.xpGold);
const PromptLibraryScreen = makePlaceholder('Prompt Library', 'library', COLORS.codeExplainer);
const PromptBattleScreen = makePlaceholder('Prompt Battle', 'flash', COLORS.streak);

// ==========================================
// Loading Screen
// ==========================================

function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <Ionicons name="sparkles" size={48} color={COLORS.primary} />
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={{ marginTop: SPACING.lg }}
      />
      <Text style={loadingStyles.text}>Loading Promptcraft Academy...</Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
});

// ==========================================
// Tab Icon Config
// ==========================================

type TabIconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  label: string;
  iconFocused: TabIconName;
  iconDefault: TabIconName;
  color: string;
}

const TAB_CONFIG: Record<keyof MainTabParamList, TabConfig> = {
  Home: {
    label: 'Home',
    iconFocused: 'home',
    iconDefault: 'home-outline',
    color: COLORS.primary,
  },
  Tracks: {
    label: 'Tracks',
    iconFocused: 'map',
    iconDefault: 'map-outline',
    color: COLORS.webBuilder,
  },
  Create: {
    label: 'Create',
    iconFocused: 'add-circle',
    iconDefault: 'add-circle-outline',
    color: COLORS.artFactory,
  },
  Battles: {
    label: 'Battles',
    iconFocused: 'trophy',
    iconDefault: 'trophy-outline',
    color: COLORS.xpGold,
  },
  Profile: {
    label: 'Profile',
    iconFocused: 'person-circle',
    iconDefault: 'person-circle-outline',
    color: COLORS.primaryLight,
  },
};

// ==========================================
// Bottom Tab Navigator
// ==========================================

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: tabBarStyles.tabBar,
        tabBarLabelStyle: tabBarStyles.tabBarLabel,
        tabBarItemStyle: tabBarStyles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: TAB_CONFIG.Home.label,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.Home.iconFocused : TAB_CONFIG.Home.iconDefault}
              size={size}
              color={focused ? TAB_CONFIG.Home.color : COLORS.textLight}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Tracks"
        component={TracksScreen}
        options={{
          tabBarLabel: TAB_CONFIG.Tracks.label,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.Tracks.iconFocused : TAB_CONFIG.Tracks.iconDefault}
              size={size}
              color={focused ? TAB_CONFIG.Tracks.color : COLORS.textLight}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarLabel: TAB_CONFIG.Create.label,
          tabBarIcon: ({ focused, size }) => (
            <View
              style={[
                tabBarStyles.createButtonWrapper,
                focused && tabBarStyles.createButtonWrapperActive,
              ]}
            >
              <Ionicons
                name={focused ? TAB_CONFIG.Create.iconFocused : TAB_CONFIG.Create.iconDefault}
                size={size + 8}
                color={focused ? COLORS.surface : TAB_CONFIG.Create.color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Battles"
        component={BattlesScreen}
        options={{
          tabBarLabel: TAB_CONFIG.Battles.label,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.Battles.iconFocused : TAB_CONFIG.Battles.iconDefault}
              size={size}
              color={focused ? TAB_CONFIG.Battles.color : COLORS.textLight}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: TAB_CONFIG.Profile.label,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.Profile.iconFocused : TAB_CONFIG.Profile.iconDefault}
              size={size}
              color={focused ? TAB_CONFIG.Profile.color : COLORS.textLight}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const tabBarStyles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 12,
    left: 16,
    right: 16,
    height: 68,
    borderRadius: RADIUS.xxl,
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
    paddingTop: 8,
    ...SHADOWS.medium,
  },
  tabBarLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  createButtonWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.artFactory + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  createButtonWrapperActive: {
    backgroundColor: COLORS.artFactory,
    ...SHADOWS.small,
  },
});

// ==========================================
// Root Stack Navigator
// ==========================================

const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ParentConsent" component={ParentConsentScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="TrackDetail"
        component={TrackDetailScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="LessonScreen"
        component={LessonScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ProjectView"
        component={ProjectViewScreen}
        options={{ animation: 'fade_from_bottom' }}
      />
      <Stack.Screen
        name="PromptBattle"
        component={PromptBattleScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ParentDashboard"
        component={ParentDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Parent Dashboard',
          headerTintColor: COLORS.primary,
          headerStyle: { backgroundColor: COLORS.background },
          headerTitleStyle: {
            fontWeight: FONTS.weights.bold,
            fontSize: FONTS.sizes.xl,
          },
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          headerTintColor: COLORS.primary,
          headerStyle: { backgroundColor: COLORS.background },
          headerTitleStyle: {
            fontWeight: FONTS.weights.bold,
            fontSize: FONTS.sizes.xl,
          },
        }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Subscription',
          headerTintColor: COLORS.primary,
          headerStyle: { backgroundColor: COLORS.background },
          headerTitleStyle: {
            fontWeight: FONTS.weights.bold,
            fontSize: FONTS.sizes.xl,
          },
        }}
      />
      <Stack.Screen
        name="PromptLibrary"
        component={PromptLibraryScreen}
        options={{
          headerShown: true,
          headerTitle: 'Prompt Library',
          headerTintColor: COLORS.primary,
          headerStyle: { backgroundColor: COLORS.background },
          headerTitleStyle: {
            fontWeight: FONTS.weights.bold,
            fontSize: FONTS.sizes.xl,
          },
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}

// ==========================================
// App Navigator (exported root)
// ==========================================

export default function AppNavigator() {
  const { isLoading, isAuthenticated, hasOnboarded } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Not onboarded or not authenticated → auth flow
  if (!hasOnboarded || !isAuthenticated) {
    return <AuthStack />;
  }

  // Authenticated → main app
  return <MainStack />;
}
