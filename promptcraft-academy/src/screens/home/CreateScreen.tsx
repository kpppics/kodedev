import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { TrackId, RootStackParamList } from '../../types';
import { aiService } from '../../services/ai';

interface TrackOption {
  id: TrackId;
  label: string;
  emoji: string;
  color: string;
  placeholder: string;
}

const TRACKS: TrackOption[] = [
  { id: 'story-studio',    label: 'Story Studio',     emoji: '📖', color: '#FF6B6B', placeholder: 'A brave rabbit who discovers a hidden city underground...' },
  { id: 'web-builder',     label: 'Web Builder Jr',   emoji: '🌐', color: '#4ECDC4', placeholder: 'A fun page about space with stars and rocket buttons...' },
  { id: 'game-maker',      label: 'Game Maker',       emoji: '🎮', color: '#FFE66D', placeholder: 'A catch game where you collect falling stars with a basket...' },
  { id: 'art-factory',     label: 'Art Factory',      emoji: '🎨', color: '#FF8A5C', placeholder: 'A cartoon dragon in a rainforest at sunset, watercolour style...' },
  { id: 'music-maker',     label: 'Music Maker',      emoji: '🎵', color: '#95E1D3', placeholder: 'A happy birthday song with drums, piano, and a fun beat...' },
  { id: 'code-explainer',  label: 'Code Explainer',   emoji: '💻', color: '#AA96DA', placeholder: 'Paste some code here and I\'ll explain it to you...' },
];

export default function CreateScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedTrack, setSelectedTrack] = useState<TrackOption>(TRACKS[0]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Add a prompt!', 'Tell the AI what you want to create first 😊');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      let output = '';
      switch (selectedTrack.id) {
        case 'story-studio': {
          const r = await aiService.generateStory({ prompt });
          output = `📖 ${r.title}\n\n${r.story}`;
          break;
        }
        case 'web-builder': {
          const r = await aiService.generateWebpage({ prompt });
          output = r.html;
          break;
        }
        case 'game-maker': {
          const r = await aiService.generateGame({ prompt });
          output = r.html;
          break;
        }
        case 'art-factory': {
          const r = await aiService.generateArt({ prompt });
          output = `🎨 Enriched prompt:\n${r.imagePrompt}\n\n${r.description}`;
          break;
        }
        case 'music-maker': {
          const r = await aiService.generateMusic({ prompt });
          output = `🎵 ${r.description}\nTempo: ${r.tempo} | Mood: ${r.mood}`;
          break;
        }
        case 'code-explainer': {
          const r = await aiService.explainCode({ code: prompt });
          output = r.explanation;
          break;
        }
      }
      setResult(output);
    } catch (e) {
      Alert.alert('Oops!', 'Something went wrong. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Quick Create ✨</Text>
      <Text style={styles.sub}>Pick a track, type your idea, and let the AI do the magic!</Text>

      {/* Track Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trackScroll}>
        {TRACKS.map(track => (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.trackChip,
              { backgroundColor: selectedTrack.id === track.id ? track.color : COLORS.surface },
              selectedTrack.id === track.id && SHADOWS.small,
            ]}
            onPress={() => { setSelectedTrack(track); setResult(null); setPrompt(''); }}
          >
            <Text style={styles.trackChipEmoji}>{track.emoji}</Text>
            <Text style={[
              styles.trackChipLabel,
              { color: selectedTrack.id === track.id ? '#fff' : COLORS.text },
            ]}>{track.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Prompt Input */}
      <View style={[styles.inputCard, { borderColor: selectedTrack.color }]}>
        <Text style={[styles.inputLabel, { color: selectedTrack.color }]}>
          {selectedTrack.emoji} Your prompt
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder={selectedTrack.placeholder}
          placeholderTextColor={COLORS.textLight}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <View style={styles.inputFooter}>
          <Text style={styles.charCount}>{prompt.length} / 500</Text>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: selectedTrack.color }, loading && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Ionicons name="flash" size={16} color="#fff" /><Text style={styles.createBtnText}> Create!</Text></>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* Provider info */}
      <Text style={styles.providerNote}>
        Powered by {aiService.getAvailableProviders().join(' & ')}
      </Text>

      {/* Result */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={[styles.resultTitle, { color: selectedTrack.color }]}>
            {selectedTrack.emoji} Here's what the AI made!
          </Text>
          <Text style={styles.resultText}>{result}</Text>
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="bookmark-outline" size={16} color={COLORS.primary} />
              <Text style={styles.actionBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="share-social-outline" size={16} color={COLORS.primary} />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: selectedTrack.color + '20' }]}
              onPress={() => navigation.navigate('TrackDetail', { trackId: selectedTrack.id })}
            >
              <Ionicons name="expand-outline" size={16} color={selectedTrack.color} />
              <Text style={[styles.actionBtnText, { color: selectedTrack.color }]}>Full Studio</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingBottom: SPACING.huge },
  heading: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.extrabold, color: COLORS.text },
  sub: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.lg },
  trackScroll: { marginBottom: SPACING.lg, marginHorizontal: -SPACING.xl, paddingHorizontal: SPACING.xl },
  trackChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, marginRight: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  trackChipEmoji: { fontSize: 16 },
  trackChipLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    ...SHADOWS.medium,
    marginBottom: SPACING.sm,
  },
  inputLabel: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, marginBottom: SPACING.sm },
  textInput: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    minHeight: 100,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  createBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  createBtnText: { color: '#fff', fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.md },
  providerNote: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, textAlign: 'center', marginBottom: SPACING.lg },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  resultTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, marginBottom: SPACING.md },
  resultText: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 22, marginBottom: SPACING.lg },
  resultActions: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  actionBtnText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: FONTS.weights.medium },
});
