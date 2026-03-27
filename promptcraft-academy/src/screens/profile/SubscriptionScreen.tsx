// ==========================================
// SUBSCRIPTION SCREEN — Go Cosmo
// Professional pricing for parents
// ==========================================
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { SubscriptionTier } from '../../types';
import Cosmo from '../../components/mascot/Cosmo';

const { width: W } = Dimensions.get('window');

interface Plan {
  tier: SubscriptionTier;
  name: string;
  monthly: string;
  yearly: string;
  yearlyMonthly: string;
  saving: string;
  color: string;
  gradient: readonly [string, string];
  badge?: string;
  highlighted: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    tier: 'free',
    name: 'Explorer',
    monthly: 'FREE',
    yearly: 'FREE',
    yearlyMonthly: 'Free forever',
    saving: '',
    color: '#6B7280',
    gradient: ['#9CA3AF', '#6B7280'],
    highlighted: false,
    features: [
      '3 AI creations per day',
      'Story Studio access',
      'Cosmo chat (10 msgs/day)',
      'Basic progress tracking',
      'Parent dashboard view',
    ],
  },
  {
    tier: 'junior',
    name: 'Junior Creator',
    monthly: '£4.99',
    yearly: '£39.99',
    yearlyMonthly: '£3.33/mo',
    saving: 'Save 33%',
    color: COLORS.primary,
    gradient: ['#FF3CAC', '#FF7043'],
    badge: 'Most Popular',
    highlighted: true,
    features: [
      'Unlimited AI creations',
      'All 6 learning tracks',
      'Unlimited Cosmo chat',
      'Voice conversations with Cosmo',
      'XP, badges & leaderboard',
      'Project gallery & sharing',
      'Detailed progress reports',
      'Parent dashboard + alerts',
    ],
  },
  {
    tier: 'family',
    name: 'Family Plan',
    monthly: '£9.99',
    yearly: '£79.99',
    yearlyMonthly: '£6.67/mo',
    saving: 'Save 33%',
    color: COLORS.secondary,
    gradient: ['#2B5CE6', '#9B5DE5'],
    badge: 'Best Value',
    highlighted: false,
    features: [
      'Everything in Junior Creator',
      'Up to 4 children',
      'Family leaderboard',
      'Classroom mode',
      'Priority AI responses',
      'Exclusive Cosmo costumes',
      'Weekly family challenge',
      'Premium support',
    ],
  },
];

const TRUST_BADGES = [
  { icon: '🔒', label: 'COPPA\nCompliant' },
  { icon: '⭐', label: 'Kid\nSafe AI' },
  { icon: '🚫', label: 'Ad\nFree' },
  { icon: '💳', label: 'Cancel\nAnytime' },
];

const REVIEWS = [
  { name: 'Sarah M.', text: 'My daughter uses it every single day — she\'s learned more about AI in a week than I have in years!', stars: 5 },
  { name: 'James T.', text: 'The games Cosmo helps them build are actually playable! My son is obsessed.', stars: 5 },
  { name: 'Emma R.', text: 'Finally an app that keeps them learning AND entertained. Worth every penny.', stars: 5 },
];

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [selected, setSelected] = useState<SubscriptionTier>('junior');
  const cosmoMood = useRef<'celebrating' | 'happy' | 'excited'>('happy');
  const glowAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const getPrice = (plan: Plan) =>
    billing === 'yearly' ? (plan.yearly === 'FREE' ? 'FREE' : plan.yearlyMonthly) : plan.monthly;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <LinearGradient colors={['#2B0050', '#7B2FAE', '#FF3CAC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={[s.blob, { top: -30, right: -20, width: 130, height: 130 }]} />
        <View style={[s.blob, { bottom: -20, left: -20, width: 90, height: 90 }]} />

        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Cosmo mood="celebrating" size={110} animate />
        <Text style={s.heroTitle}>Unlock the Full{'\n'}Go Cosmo Experience!</Text>
        <Text style={s.heroSub}>Join thousands of kids learning AI skills and having a blast every day 🚀</Text>

        {/* Trust badges */}
        <View style={s.trustRow}>
          {TRUST_BADGES.map(b => (
            <View key={b.label} style={s.trustBadge}>
              <Text style={s.trustIcon}>{b.icon}</Text>
              <Text style={s.trustLabel}>{b.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Billing toggle */}
      <View style={s.billingWrap}>
        <View style={s.billingToggle}>
          <TouchableOpacity
            style={[s.billingBtn, billing === 'monthly' && s.billingBtnActive]}
            onPress={() => setBilling('monthly')}
          >
            <Text style={[s.billingBtnText, billing === 'monthly' && s.billingBtnTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.billingBtn, billing === 'yearly' && s.billingBtnActive]}
            onPress={() => setBilling('yearly')}
          >
            <Text style={[s.billingBtnText, billing === 'yearly' && s.billingBtnTextActive]}>Yearly</Text>
            <View style={s.saveBadge}><Text style={s.saveBadgeText}>Save 33%</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Plan cards */}
      <View style={s.plansWrap}>
        {PLANS.map(plan => {
          const isSelected = selected === plan.tier;
          return (
            <TouchableOpacity
              key={plan.tier}
              onPress={() => setSelected(plan.tier)}
              activeOpacity={0.88}
            >
              <Animated.View style={[
                s.planCard,
                isSelected && s.planCardSelected,
                isSelected && plan.highlighted && { opacity: glowAnim },
              ]}>
                {plan.badge && (
                  <LinearGradient colors={plan.gradient} style={s.planBadge}>
                    <Text style={s.planBadgeText}>{plan.badge}</Text>
                  </LinearGradient>
                )}

                <View style={s.planHeader}>
                  <View style={[s.planDot, isSelected && { backgroundColor: plan.color }]} />
                  <View style={s.planTitleWrap}>
                    <Text style={s.planName}>{plan.name}</Text>
                    <Text style={s.planPrice}>
                      {getPrice(plan)}
                      {getPrice(plan) !== 'FREE' && getPrice(plan) !== plan.yearlyMonthly && <Text style={s.planPer}>/mo</Text>}
                    </Text>
                    {billing === 'yearly' && plan.saving && (
                      <Text style={s.planSaving}>{plan.saving} vs monthly</Text>
                    )}
                  </View>
                  {isSelected && (
                    <LinearGradient colors={plan.gradient} style={s.checkCircle}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </LinearGradient>
                  )}
                </View>

                {plan.features.map(f => (
                  <View key={f} style={s.featureRow}>
                    <LinearGradient colors={isSelected ? plan.gradient : ['#D1D5DB', '#9CA3AF']} style={s.featureDot}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </LinearGradient>
                    <Text style={[s.featureText, !isSelected && s.featureTextDim]}>{f}</Text>
                  </View>
                ))}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CTA */}
      <View style={s.ctaWrap}>
        {selected !== 'free' ? (
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient
              colors={PLANS.find(p => p.tier === selected)?.gradient ?? ['#FF3CAC', '#FF7043']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaBtnText}>
                Start Free 7-Day Trial 🚀
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.ctaBtnFree} activeOpacity={0.9} onPress={() => navigation.goBack()}>
            <Text style={s.ctaBtnFreeText}>Continue with Free Plan</Text>
          </TouchableOpacity>
        )}
        <Text style={s.ctaNote}>
          {selected !== 'free'
            ? '7-day free trial · Cancel anytime · No commitment'
            : 'Upgrade anytime to unlock all features'}
        </Text>
      </View>

      {/* Reviews */}
      <View style={s.reviewsSection}>
        <Text style={s.reviewsTitle}>💬 What Parents Say</Text>
        {REVIEWS.map((r, i) => (
          <View key={i} style={s.reviewCard}>
            <View style={s.reviewStars}>
              {Array.from({ length: r.stars }).map((_, j) => (
                <Ionicons key={j} name="star" size={14} color="#FFD60A" />
              ))}
            </View>
            <Text style={s.reviewText}>"{r.text}"</Text>
            <Text style={s.reviewName}>— {r.name}</Text>
          </View>
        ))}
      </View>

      <Text style={s.legal}>
        Subscriptions auto-renew unless cancelled 24 hours before renewal. Managed via your App Store / Google Play account.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 60 },

  hero: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    overflow: 'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 36,
    left: SPACING.lg,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: '#fff', textAlign: 'center', marginTop: SPACING.md, lineHeight: 32 },
  heroSub: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: SPACING.sm, lineHeight: 22 },

  trustRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
  trustBadge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, minWidth: 64 },
  trustIcon: { fontSize: 22 },
  trustLabel: { fontSize: FONTS.sizes.xs, color: '#fff', textAlign: 'center', marginTop: 3, lineHeight: 14, fontWeight: FONTS.weights.semibold },

  billingWrap: { alignItems: 'center', paddingVertical: SPACING.xl },
  billingToggle: { flexDirection: 'row', backgroundColor: '#F0E0F5', borderRadius: RADIUS.full, padding: 4 },
  billingBtn: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, flexDirection: 'row', alignItems: 'center', gap: 6 },
  billingBtnActive: { backgroundColor: '#fff', ...SHADOWS.small },
  billingBtnText: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.textSecondary },
  billingBtnTextActive: { color: COLORS.text },
  saveBadge: { backgroundColor: COLORS.success, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  saveBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, color: '#fff' },

  plansWrap: { paddingHorizontal: SPACING.lg, gap: SPACING.md },
  planCard: { backgroundColor: '#fff', borderRadius: RADIUS.xxl, padding: SPACING.xl, borderWidth: 2, borderColor: COLORS.border, ...SHADOWS.small, overflow: 'hidden' },
  planCardSelected: { borderColor: COLORS.primary, ...SHADOWS.medium },
  planBadge: { position: 'absolute', top: 0, right: 0, paddingHorizontal: SPACING.md, paddingVertical: 5, borderBottomLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.xxl },
  planBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.black, color: '#fff' },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.md },
  planDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, backgroundColor: 'transparent' },
  planTitleWrap: { flex: 1 },
  planName: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text },
  planPrice: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.black, color: COLORS.text, marginTop: 2 },
  planPer: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.regular, color: COLORS.textSecondary },
  planSaving: { fontSize: FONTS.sizes.xs, color: COLORS.success, fontWeight: FONTS.weights.bold, marginTop: 2 },
  checkCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 8 },
  featureDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureText: { fontSize: FONTS.sizes.md, color: COLORS.text, flex: 1, lineHeight: 20 },
  featureTextDim: { color: COLORS.textSecondary },

  ctaWrap: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl, gap: SPACING.sm },
  ctaBtn: { borderRadius: RADIUS.full, paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.medium },
  ctaBtnText: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: '#fff' },
  ctaBtnFree: { borderRadius: RADIUS.full, paddingVertical: SPACING.lg, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border },
  ctaBtnFreeText: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.textSecondary },
  ctaNote: { textAlign: 'center', fontSize: FONTS.sizes.sm, color: COLORS.textLight },

  reviewsSection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl, gap: SPACING.md },
  reviewsTitle: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.black, color: COLORS.text, marginBottom: SPACING.sm },
  reviewCard: { backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.small },
  reviewStars: { flexDirection: 'row', gap: 2, marginBottom: SPACING.sm },
  reviewText: { fontSize: FONTS.sizes.md, color: COLORS.text, fontStyle: 'italic', lineHeight: 22 },
  reviewName: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, fontWeight: FONTS.weights.semibold },

  legal: { textAlign: 'center', fontSize: FONTS.sizes.xs, color: COLORS.textLight, paddingHorizontal: SPACING.xl, marginTop: SPACING.lg, lineHeight: 16 },
});
