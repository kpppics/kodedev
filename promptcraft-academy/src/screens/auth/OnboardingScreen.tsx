import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface OnboardingPage {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  backgroundColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  features: { icon: keyof typeof Ionicons.glyphMap; text: string }[];
}

const pages: OnboardingPage[] = [
  {
    id: '1',
    title: 'Create Amazing Things\nwith AI',
    subtitle: 'Stories, Games, Art & More!',
    emoji: '🚀',
    description:
      'Learn to write awesome prompts and build incredible projects with the power of AI.',
    backgroundColor: '#6C5CE7',
    iconName: 'sparkles',
    features: [
      { icon: 'book-outline', text: 'Write epic stories' },
      { icon: 'game-controller-outline', text: 'Design cool games' },
      { icon: 'color-palette-outline', text: 'Create amazing art' },
    ],
  },
  {
    id: '2',
    title: 'Learn Prompt Skills',
    subtitle: 'Level Up & Earn Badges!',
    emoji: '🏆',
    description:
      'Complete challenges, earn XP, and collect badges as you master the art of prompting.',
    backgroundColor: '#FF6B6B',
    iconName: 'trophy',
    features: [
      { icon: 'star-outline', text: 'Earn XP points' },
      { icon: 'ribbon-outline', text: 'Collect cool badges' },
      { icon: 'trending-up-outline', text: 'Track your progress' },
    ],
  },
  {
    id: '3',
    title: 'Safe & Fun\nfor Everyone',
    subtitle: 'Parents Stay in Control',
    emoji: '🛡️',
    description:
      'Built with safety first. Parents can monitor activity, set limits, and review content.',
    backgroundColor: '#4ECDC4',
    iconName: 'shield-checkmark',
    features: [
      { icon: 'time-outline', text: 'Screen time controls' },
      { icon: 'eye-outline', text: 'Activity monitoring' },
      { icon: 'lock-closed-outline', text: 'Age-appropriate content' },
    ],
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleGetStarted = () => {
    navigation.replace('ParentConsent');
  };

  const handleSkip = () => {
    navigation.replace('ParentConsent');
  };

  const renderPage = ({ item, index }: { item: OnboardingPage; index: number }) => (
    <View style={[styles.page, { width }]}>
      {/* Illustration Area */}
      <View style={[styles.illustrationContainer, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />

        <Text style={styles.bigEmoji}>{item.emoji}</Text>

        <View style={styles.iconRow}>
          {item.features.map((feature, i) => (
            <View key={i} style={styles.floatingIcon}>
              <Ionicons name={feature.icon} size={28} color={COLORS.surface} />
            </View>
          ))}
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        <Text style={styles.pageTitle}>{item.title}</Text>
        <Text style={styles.pageSubtitle}>{item.subtitle}</Text>
        <Text style={styles.pageDescription}>{item.description}</Text>

        {/* Feature List */}
        <View style={styles.featureList}>
          {item.features.map((feature, i) => (
            <View key={i} style={styles.featureItem}>
              <View
                style={[styles.featureIconContainer, { backgroundColor: item.backgroundColor + '20' }]}
              >
                <Ionicons name={feature.icon} size={20} color={item.backgroundColor} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const isLastPage = currentIndex === pages.length - 1;

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {!isLastPage && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {pages.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: pages[currentIndex].backgroundColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        {isLastPage ? (
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: pages[currentIndex].backgroundColor }]}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={22} color={COLORS.surface} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: pages[currentIndex].backgroundColor }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward" size={24} color={COLORS.surface} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: SPACING.xl,
    zIndex: 10,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  page: {
    flex: 1,
  },
  illustrationContainer: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -40,
    left: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -30,
    right: -20,
  },
  decorCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: 60,
    right: 40,
  },
  bigEmoji: {
    fontSize: 100,
    marginBottom: SPACING.lg,
  },
  iconRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  floatingIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xxxl,
    paddingTop: SPACING.xxxl,
  },
  pageTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 34,
  },
  pageSubtitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  pageDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  featureList: {
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
  },
  bottomContainer: {
    paddingHorizontal: SPACING.xxxl,
    paddingBottom: SPACING.huge,
    alignItems: 'center',
    gap: SPACING.xxl,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
    width: '100%',
    ...SHADOWS.medium,
  },
  getStartedText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.surface,
  },
});
