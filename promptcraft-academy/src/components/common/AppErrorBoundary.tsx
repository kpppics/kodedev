// ==========================================
// APP ERROR BOUNDARY — Go Cosmo
// Catches React crashes and shows a friendly
// kid-facing screen instead of a white crash
// ==========================================
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AppErrorBoundary]', error.message, info.componentStack?.slice(0, 200));
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={s.root}>
        <Text style={s.emoji}>🤖</Text>
        <Text style={s.title}>Oops! Cosmo tripped!</Text>
        <Text style={s.subtitle}>
          Something went a little wrong, but don't worry — it's not your fault!{'\n'}
          Tap below to try again.
        </Text>
        <TouchableOpacity style={s.btn} onPress={this.handleRetry} activeOpacity={0.85}>
          <Text style={s.btnText}>Try Again 🚀</Text>
        </TouchableOpacity>
        {__DEV__ && this.state.error && (
          <Text style={s.devError} numberOfLines={4}>
            {this.state.error.message}
          </Text>
        )}
      </View>
    );
  }
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  emoji: { fontSize: 72, marginBottom: SPACING.xl },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
  },
  btnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
    color: '#fff',
  },
  devError: {
    marginTop: SPACING.xl,
    fontSize: FONTS.sizes.xs,
    color: COLORS.error,
    backgroundColor: COLORS.error + '12',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    textAlign: 'center',
  },
});
