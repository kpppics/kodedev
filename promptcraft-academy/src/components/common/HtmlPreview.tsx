// ==========================================
// HTML PREVIEW — renders HTML on web (iframe) and native (WebView)
// ==========================================
import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

interface Props {
  html: string;
  height?: number;
  title?: string;
}

export default function HtmlPreview({ html, height = 420, title }: Props) {
  if (!html) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }]}>
        {title && <Text style={styles.label}>{title}</Text>}
        {/* @ts-ignore — iframe is valid on web */}
        <iframe
          srcDoc={html}
          style={{ width: '100%', height: title ? height - 30 : height, border: 'none', borderRadius: 8 }}
          sandbox="allow-scripts allow-same-origin"
          title={title ?? 'Preview'}
        />
      </View>
    );
  }

  // Native — requires react-native-webview
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { WebView } = require('react-native-webview');
    return (
      <View style={[styles.container, { height }]}>
        {title && <Text style={styles.label}>{title}</Text>}
        <WebView
          source={{ html }}
          style={{ flex: 1, borderRadius: 8 }}
          scrollEnabled
          javaScriptEnabled
          originWhitelist={['*']}
        />
      </View>
    );
  } catch {
    return (
      <View style={[styles.fallback, { height }]}>
        <Text style={styles.fallbackText}>Install react-native-webview to preview on device</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.surface,
  },
  fallback: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  fallbackText: {
    color: COLORS.textLight,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
  },
});
