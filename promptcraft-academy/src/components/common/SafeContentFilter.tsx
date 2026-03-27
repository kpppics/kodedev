import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

type AgeGroup = 'kids' | 'teens' | 'all';

interface SafeContentFilterProps {
  children: React.ReactNode;
  ageGroup?: AgeGroup;
  onReport?: (reason: string) => void;
  contentId?: string;
  style?: ViewStyle;
}

const ageLabels: Record<AgeGroup, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  kids: { label: 'Ages 6-12', color: COLORS.success, icon: 'happy-outline' },
  teens: { label: 'Ages 13+', color: COLORS.warning, icon: 'person-outline' },
  all: { label: 'All Ages', color: COLORS.primary, icon: 'people-outline' },
};

const reportReasons = [
  'Inappropriate language',
  'Scary or violent content',
  'Incorrect information',
  'Not age-appropriate',
  'Other concern',
];

const SafeContentFilter: React.FC<SafeContentFilterProps> = ({
  children,
  ageGroup = 'all',
  onReport,
  contentId,
  style,
}) => {
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  const ageConfig = ageLabels[ageGroup];

  const handleReport = () => {
    if (selectedReason && onReport) {
      onReport(selectedReason);
    }
    setReported(true);
    setReportModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={[styles.ageBadge, { backgroundColor: `${ageConfig.color}15` }]}>
          <Ionicons name={ageConfig.icon} size={14} color={ageConfig.color} />
          <Text style={[styles.ageText, { color: ageConfig.color }]}>
            {ageConfig.label}
          </Text>
        </View>
        <View style={styles.safeIndicator}>
          <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
          <Text style={styles.safeText}>Safe Content</Text>
        </View>
      </View>

      <View style={styles.contentArea}>{children}</View>

      <View style={styles.footer}>
        {reported ? (
          <View style={styles.reportedContainer}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.reportedText}>Report submitted. Thank you!</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setReportModalVisible(true)}
            style={styles.reportButton}
            activeOpacity={0.7}
          >
            <Ionicons name="flag-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Content</Text>
              <TouchableOpacity
                onPress={() => setReportModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Why are you reporting this content?
            </Text>

            {reportReasons.map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => setSelectedReason(reason)}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionSelected,
                ]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={selectedReason === reason ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selectedReason === reason ? COLORS.primary : COLORS.textLight}
                />
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextSelected,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleReport}
              disabled={!selectedReason}
              style={[styles.submitButton, !selectedReason && styles.submitButtonDisabled]}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  ageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  ageText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
  },
  safeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  safeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.success,
  },
  contentArea: {
    padding: SPACING.lg,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  reportButtonText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  reportedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  reportedText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontWeight: FONTS.weights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    gap: SPACING.md,
  },
  reasonOptionSelected: {
    backgroundColor: COLORS.surfaceLight,
  },
  reasonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  reasonTextSelected: {
    color: COLORS.text,
    fontWeight: FONTS.weights.medium,
  },
  submitButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});

export default SafeContentFilter;
