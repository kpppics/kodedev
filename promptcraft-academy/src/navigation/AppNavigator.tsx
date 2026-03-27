// ==========================================
// PROMPTCRAFT ACADEMY - App Navigator
// ==========================================

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList, MainTabParamList, TrackId } from '../types';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// ---- Auth Screens ----
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import ParentConsentScreen from '../screens/auth/ParentConsentScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// ---- Main/Home Screens ----
import HomeScreen from '../screens/home/HomeScreen';
import TracksScreen from '../screens/home/TracksScreen';
import CreateScreen from '../screens/home/CreateScreen';

// ---- Track Screens ----
import TrackDetailScreen from '../screens/tracks/TrackDetailScreen';
import StoryStudioScreen from '../screens/tracks/StoryStudioScreen';
import WebBuilderScreen from '../screens/tracks/WebBuilderScreen';
import GameMakerScreen from '../screens/tracks/GameMakerScreen';
import ArtFactoryScreen from '../screens/tracks/ArtFactoryScreen';
import MusicMakerScreen from '../screens/tracks/MusicMakerScreen';
import CodeExplainerScreen from '../screens/tracks/CodeExplainerScreen';

// ---- Gamification Screens ----
import BattlesScreen from '../screens/gamification/BattlesScreen';
import BattleDetailScreen from '../screens/gamification/BattleDetailScreen';
import LeaderboardScreen from '../screens/gamification/LeaderboardScreen';
import QuestsScreen from '../screens/gamification/QuestsScreen';
import BadgesScreen from '../screens/gamification/BadgesScreen';

// ---- Profile Screens ----
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import SubscriptionScreen from '../screens/profile/SubscriptionScreen';
import PromptLibraryScreen from '../screens/profile/PromptLibraryScreen';

// ---- Cosmo + Adventures ----
import CosmoChatScreen from '../screens/cosmo/CosmoChatScreen';
import CodeAdventuresScreen from '../screens/cosmo/CodeAdventuresScreen';
import ParentDashboardScreen from '../screens/parent/ParentDashboardScreen';
import ProgressReportScreen from '../screens/parent/ProgressReportScreen';
import ClassroomScreen from '../screens/parent/ClassroomScreen';

// ==========================================
// Lesson Screen — routes to the right studio
// ==========================================

const STUDIO_SCREENS: Record<TrackId, React.ComponentType<any>> = {
  'story-studio': StoryStudioScreen,
  'web-builder': WebBuilderScreen,
  'game-maker': GameMakerScreen,
  'art-factory': ArtFactoryScreen,
  'music-maker': MusicMakerScreen,
  'code-explainer': CodeExplainerScreen,
};

function LessonScreen({ route }: any) {
  const trackId: TrackId = route?.params?.trackId ?? 'story-studio';
  const Studio = STUDIO_SCREENS[trackId] ?? StoryStudioScreen;
  return <Studio />;
}

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
      <Text style={loadingStyles.text}>Loading Go Cosmo...</Text>
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
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

const headerOptions = {
  headerTintColor: COLORS.primary,
  headerStyle: { backgroundColor: COLORS.background },
  headerTitleStyle: { fontWeight: FONTS.weights.bold as any, fontSize: FONTS.sizes.xl },
};

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

      {/* Cosmo Chat + Adventures */}
      <Stack.Screen name="CosmoChat" component={CosmoChatScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="CodeAdventures" component={CodeAdventuresScreen} options={{ animation: 'slide_from_bottom' }} />

      {/* Track screens */}
      <Stack.Screen name="TrackDetail" component={TrackDetailScreen} options={{ animation: 'slide_from_bottom', headerShown: true, headerTitle: '', headerTintColor: COLORS.primary, headerStyle: { backgroundColor: COLORS.background }, headerShadowVisible: false }} />
      <Stack.Screen name="LessonScreen" component={LessonScreen} options={{ animation: 'slide_from_bottom', headerShown: true, headerTitle: '', headerTintColor: COLORS.primary, headerStyle: { backgroundColor: COLORS.background }, headerShadowVisible: false }} />

      {/* Gamification */}
      <Stack.Screen name="PromptBattle" component={BattleDetailScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ headerShown: true, headerTitle: 'Leaderboard', ...headerOptions }} />
      <Stack.Screen name="Quests" component={QuestsScreen} options={{ headerShown: true, headerTitle: 'Daily Quests', ...headerOptions }} />
      <Stack.Screen name="Badges" component={BadgesScreen} options={{ headerShown: true, headerTitle: 'Badges', ...headerOptions }} />

      {/* Profile */}
      <Stack.Screen name="ProjectView" component={CreateScreen} options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} options={{ headerShown: true, headerTitle: 'Parent Dashboard', ...headerOptions }} />
      <Stack.Screen name="ProgressReport" component={ProgressReportScreen} options={{ headerShown: true, headerTitle: 'Progress Report', ...headerOptions }} />
      <Stack.Screen name="ClassroomView" component={ClassroomScreen} options={{ headerShown: true, headerTitle: 'Classroom', ...headerOptions }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, headerTitle: 'Settings', ...headerOptions }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true, headerTitle: 'Subscription', ...headerOptions }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="PromptLibrary" component={PromptLibraryScreen} options={{ headerShown: true, headerTitle: 'Prompt Library', ...headerOptions, animation: 'slide_from_bottom' as any }} />
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

  if (!hasOnboarded || !isAuthenticated) {
    return <AuthStack />;
  }

  return <MainStack />;
}
