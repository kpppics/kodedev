import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { SubscriptionTier } from '../../types';

// ── Types ──────────────────────────────────────────────────
interface PlanInfo {
  tier: SubscriptionTier;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  priceNote?: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

// ── Data ───────────────────────────────────────────────────
const PLANS: PlanInfo[] = [
  {
    tier: 'free',
    name: 'Free',
    monthlyPrice: '£0',
    yearlyPrice: '£0',
    features: [
      '3 projects per track',
      'Basic Story & Web tracks',
      'Prompt scoring feedback',
      'Community gallery access',
    ],
    highlighted: false,
  },
  {
    tier: 'junior',
    name: 'Junior',
    monthlyPrice: '£3.99',
    yearlyPrice: '£24.99',
    priceNote: 'Save 48% yearly',
    features: [
      'All 6 learning tracks',
      'Unlimited projects',
      'Advanced prompt analysis',
      'Prompt Battles',
      'Badges & leaderboard',
      'Offline project access',
    ],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    tier: 'family',
    name: 'Family',
    monthlyPrice: '£6.99',
    yearlyPrice: '£44.99',
    priceNote: 'Save 46% yearly',
    features: [
      'Everything in Junior',
      'Up to 4 children',
      'Parent dashboard',
      'Progress reports',
      'Screen time controls',
      'Priority support',
    ],
    highlighted: false,
    badge: 'Best Value',
  },
  {
    tier: 'classroom',
    name: 'Classroom',
    monthlyPrice: '—',
    yearlyPrice: '£49.99',
    priceNote: 'Per year',
    features: [
      'Everything in Family',
      'Up to 30 students',
      'Teacher dashboard',
      'Challenge creation',
      'Grading & feedback tools',
      'Curriculum alignment',
      'Bulk student management',
    ],
    highlighted: false,
  },
];

const FEATURE_COMPARISON = [
  { feature: 'Learning tracks', free: '2', junior: '6', family: '6', classroom: '6' },
  { feature: 'Projects', free: '3 each', junior: 'Unlimited', family: 'Unlimited', classroom: 'Unlimited' },
  { feature: 'Prompt Battles', free: '—', junior: 'Yes', family: 'Yes', classroom: 'Yes' },
  { feature: 'Children / Students', free: '1', junior: '1', family: 'Up to 4', classroom: 'Up to 30' },
  { feature: 'Parent dashboard', free: '—', junior: '—', family: 'Yes', classroom: 'Yes' },
  { feature: 'Teacher tools', free: '—', junior: '—', family: '—', classroom: 'Yes' },
  { feature: 'Offline access', free: '—', junior: 'Yes', family: 'Yes', classroom: 'Yes' },
  { feature: 'Priority support', free: '—', junior: '—', family: 'Yes', classroom: 'Yes' },
];

const CURRENT_PLAN: SubscriptionTier = 'free';

// ── Component ──────────────────────────────────────────────
export default function SubscriptionScreen() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [showComparison, setShowComparison] = useState(false);

  const renderBillingToggle = () => (
    <View style={styles.billingToggle}>
      <TouchableOpacity
        style={[styles.billingOption, billingCycle === 'monthly' && styles.billingOptionActive]}
        onPress={() => setBillingCycle('monthly')}
      >
        <Text style={[styles.billingOptionText, billingCycle === 'monthly' && styles.billingOptionTextActive]}>
          Monthly
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.billingOption, billingCycle === 'yearly' && styles.billingOptionActive]}
        onPress={() => setBillingCycle('yearly')}
      >
        <Text style={[styles.billingOptionText, billingCycle === 'yearly' && styles.billingOptionTextActive]}>
          Yearly
        </Text>
        <View style={styles.saveBadge}>
          <Text style={styles.saveBadgeText}>Save up to 48%</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderPlanCard = (plan: PlanInfo) => {
    const isCurrent = plan.tier === CURRENT_PLAN;
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const isClassroom = plan.tier === 'classroom';

    return (
      <View
        key={plan.tier}
        style={[
          styles.planCard,
          plan.highlighted && styles.planCardHighlighted,
          isCurrent && styles.planCardCurrent,
        ]}
      >
        {plan.badge && (
          <View style={[styles.planBadge, plan.highlighted && styles.planBadgeHighlighted]}>
            <Text style={[styles.planBadgeText, plan.highlighted && styles.planBadgeTextHighlighted]}>
              {plan.badge}
            </Text>
          </View>
        )}

        <Text style={[styles.planName, plan.highlighted && styles.planNameHighlighted]}>
          {plan.name}
        </Text>

        <View style={styles.planPricing}>
          <Text style={[styles.planPrice, plan.highlighted && styles.planPriceHighlighted]}>
            {price}
          </Text>
          {!isClassroom && plan.tier !== 'free' && (
            <Text style={styles.planPricePeriod}>
              /{billingCycle === 'monthly' ? 'mo' : 'yr'}
            </Text>
          )}
        </View>
        {plan.priceNote && billingCycle === 'yearly' && (
          <Text style={styles.planPriceNote}>{plan.priceNote}</Text>
        )}

        <View style={styles.planFeatures}>
          {plan.features.map((feature, i) => (
            <View key={i} style={styles.planFeatureRow}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={plan.highlighted ? COLORS.primary : COLORS.success}
              />
              <Text style={styles.planFeatureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {isCurrent ? (
          <View style={styles.currentPlanButton}>
            <Ionicons name="checkmark" size={18} color={COLORS.success} />
            <Text style={styles.currentPlanButtonText}>Current Plan</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.selectPlanButton,
              plan.highlighted && styles.selectPlanButtonHighlighted,
            ]}
          >
            <Text
              style={[
                styles.selectPlanButtonText,
                plan.highlighted && styles.selectPlanButtonTextHighlighted,
              ]}
            >
              {plan.tier === 'free' ? 'Get Started' : 'Start Free Trial'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderLifetimeOffer = () => (
    <View style={styles.lifetimeCard}>
      <View style={styles.lifetimeHeader}>
        <Ionicons name="diamond-outline" size={28} color={COLORS.xpGold} />
        <View style={styles.lifetimeInfo}>
          <Text style={styles.lifetimeTitle}>Lifetime Access</Text>
          <Text style={styles.lifetimeSubtitle}>Pay once, learn forever</Text>
        </View>
      </View>
      <View style={styles.lifetimePricing}>
        <Text style={styles.lifetimePrice}>£59.99</Text>
        <Text style={styles.lifetimePriceNote}>One-time payment - Junior plan features</Text>
      </View>
      <TouchableOpacity style={styles.lifetimeButton}>
        <Ionicons name="flash" size={18} color="#FFF" />
        <Text style={styles.lifetimeButtonText}>Get Lifetime Access</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFeatureComparison = () => (
    <View style={styles.comparisonSection}>
      <TouchableOpacity
        style={styles.comparisonToggle}
        onPress={() => setShowComparison(!showComparison)}
      >
        <Text style={styles.comparisonToggleText}>Feature Comparison</Text>
        <Ionicons
          name={showComparison ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.primary}
        />
      </TouchableOpacity>

      {showComparison && (
        <View style={styles.comparisonTable}>
          {/* Header row */}
          <View style={[styles.comparisonRow, styles.comparisonHeaderRow]}>
            <Text style={[styles.comparisonCell, styles.comparisonFeatureCell, styles.comparisonHeaderText]}>
              Feature
            </Text>
            <Text style={[styles.comparisonCell, styles.comparisonHeaderText]}>Free</Text>
            <Text style={[styles.comparisonCell, styles.comparisonHeaderText]}>Jr</Text>
            <Text style={[styles.comparisonCell, styles.comparisonHeaderText]}>Fam</Text>
            <Text style={[styles.comparisonCell, styles.comparisonHeaderText]}>Class</Text>
          </View>
          {FEATURE_COMPARISON.map((row, i) => (
            <View
              key={row.feature}
              style={[styles.comparisonRow, i % 2 === 0 && styles.comparisonRowAlt]}
            >
              <Text style={[styles.comparisonCell, styles.comparisonFeatureCell]}>
                {row.feature}
              </Text>
              <Text style={styles.comparisonCell}>{row.free}</Text>
              <Text style={styles.comparisonCell}>{row.junior}</Text>
              <Text style={styles.comparisonCell}>{row.family}</Text>
              <Text style={styles.comparisonCell}>{row.classroom}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderGuarantee = () => (
    <View style={styles.guaranteeSection}>
      <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.success} />
      <View style={styles.guaranteeInfo}>
        <Text style={styles.guaranteeTitle}>30-Day Money-Back Guarantee</Text>
        <Text style={styles.guaranteeText}>
          Not satisfied? Get a full refund within 30 days, no questions asked. Your child's progress is always saved.
        </Text>
      </View>
    </View>
  );

  // ── Main render ───────────────────────────────────────────
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={styles.headerRight} />
      </View>

      <Text style={styles.headerSubtitle}>
        Unlock the full Promptcraft Academy experience
      </Text>

      {/* Billing Toggle */}
      {renderBillingToggle()}

      {/* Plan Cards */}
      {PLANS.map(renderPlanCard)}

      {/* Lifetime Option */}
      {renderLifetimeOffer()}

      {/* Feature Comparison */}
      {renderFeatureComparison()}

      {/* Money-Back Guarantee */}
      {renderGuarantee()}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },

  // Billing Toggle
  billingToggle: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 4,
    ...SHADOWS.small,
  },
  billingOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billingOptionActive: {
    backgroundColor: COLORS.primary,
  },
  billingOptionText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  billingOptionTextActive: {
    color: '#FFF',
  },
  saveBadge: {
    backgroundColor: COLORS.xpGold + '30',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    marginTop: 2,
  },
  saveBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: '#B8860B',
  },

  // Plan Cards
  planCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  planCardHighlighted: {
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  planCardCurrent: {
    borderColor: COLORS.success,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success + '18',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  planBadgeHighlighted: {
    backgroundColor: COLORS.primary + '18',
  },
  planBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.success,
  },
  planBadgeTextHighlighted: {
    color: COLORS.primary,
  },
  planName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  planNameHighlighted: {
    color: COLORS.primary,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  planPrice: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.text,
  },
  planPriceHighlighted: {
    color: COLORS.primary,
  },
  planPricePeriod: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  planPriceNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    fontWeight: FONTS.weights.semibold,
    marginBottom: SPACING.sm,
  },
  planFeatures: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  planFeatureText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    flex: 1,
  },

  // Plan Buttons
  selectPlanButton: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  selectPlanButtonHighlighted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectPlanButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  selectPlanButtonTextHighlighted: {
    color: '#FFF',
  },
  currentPlanButton: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '12',
    borderWidth: 1.5,
    borderColor: COLORS.success,
    gap: SPACING.xs,
  },
  currentPlanButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.success,
  },

  // Lifetime
  lifetimeCard: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.xpGold,
    ...SHADOWS.medium,
  },
  lifetimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  lifetimeInfo: {
    flex: 1,
  },
  lifetimeTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  lifetimeSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  lifetimePricing: {
    marginBottom: SPACING.lg,
  },
  lifetimePrice: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.text,
  },
  lifetimePriceNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lifetimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DAA520',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  lifetimeButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: '#FFF',
  },

  // Feature Comparison
  comparisonSection: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  comparisonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  comparisonToggleText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  comparisonTable: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  comparisonHeaderRow: {
    backgroundColor: COLORS.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  comparisonRowAlt: {
    backgroundColor: COLORS.surfaceLight,
  },
  comparisonCell: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    textAlign: 'center',
  },
  comparisonFeatureCell: {
    flex: 2,
    textAlign: 'left',
    fontWeight: FONTS.weights.medium,
  },
  comparisonHeaderText: {
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    fontSize: FONTS.sizes.xs,
  },

  // Guarantee
  guaranteeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.success + '08',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
    gap: SPACING.md,
  },
  guaranteeInfo: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  guaranteeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  bottomSpacer: {
    height: SPACING.huge,
  },
});
