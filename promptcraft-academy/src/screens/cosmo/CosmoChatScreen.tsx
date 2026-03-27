// ==========================================
// COSMO CHAT — Talk to your AI buddy!
// Kid-safe interactive AI tutor with TTS
// ==========================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import Cosmo, { CosmoMood } from '../../components/mascot/Cosmo';
import { api } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mood?: string;
}

// Cosmo's opening messages — rotated daily
const COSMO_OPENERS = [
  "Hi there, superstar! 🌟 I'm Cosmo, your AI learning buddy! Ask me ANYTHING — stories, games, art, coding... let's create something epic together!",
  "Hey hey hey! 🚀 Cosmo here, ready to help you learn and have fun! What amazing thing shall we make today?",
  "WOOHOO! 🎉 My favourite human is here! I'm Cosmo — ask me about stories, games, art, or anything you're curious about!",
  "Hello, future genius! 💡 I'm Cosmo, and I LOVE helping kids learn cool things! What's on your mind today?",
];

const QUICK_PROMPTS = [
  { label: '📖 Tell me a story', message: 'Tell me a fun short story about a kid who discovers a hidden world!' },
  { label: '🎮 Help with my game', message: 'What makes a really fun game? Give me some ideas!' },
  { label: '🎨 Art ideas', message: 'Give me 3 creative art project ideas I can make today!' },
  { label: '💻 Teach me coding', message: 'Can you explain what coding is in a really fun and simple way?' },
  { label: '🎵 Music ideas', message: 'How can I make my own music at home? What would sound cool?' },
  { label: '🌍 Fun fact!', message: 'Tell me the most amazing science fact you know!' },
];

// Web Speech API TTS helper
function speak(text: string) {
  if (Platform.OS !== 'web') return;
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      // Try to pick a friendly voice
      const voices = window.speechSynthesis.getVoices();
      const friendly = voices.find(v =>
        v.name.includes('Samantha') || v.name.includes('Karen') ||
        v.name.includes('Moira') || v.name.includes('Google UK') ||
        v.lang.startsWith('en')
      );
      if (friendly) utterance.voice = friendly;
      window.speechSynthesis.speak(utterance);
    }
  } catch {}
}

function stopSpeaking() {
  if (Platform.OS === 'web' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
}

export default function CosmoChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cosmoMood, setCosmoMood] = useState<CosmoMood>('waving');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const cosmoScale = useRef(new Animated.Value(1)).current;

  // Add the opener on mount
  useEffect(() => {
    const opener = COSMO_OPENERS[Math.floor(Math.random() * COSMO_OPENERS.length)];
    setMessages([{ id: 'opener', role: 'assistant', content: opener, mood: 'waving' }]);
    setTimeout(() => setCosmoMood('happy'), 2500);
  }, []);

  const animateCosmo = () => {
    Animated.sequence([
      Animated.spring(cosmoScale, { toValue: 1.12, useNativeDriver: true }),
      Animated.spring(cosmoScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || loading) return;

    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText };
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setCosmoMood('thinking');
    stopSpeaking();
    setIsSpeaking(false);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await api.cosmoChat({ message: messageText, history });
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        mood: response.mood,
      };

      setMessages(prev => [...prev, assistantMsg]);

      const mood = (response.mood as CosmoMood) || 'happy';
      setCosmoMood(mood);
      animateCosmo();

      // Auto-speak Cosmo's reply
      speak(response.reply);
      setIsSpeaking(true);

      setTimeout(() => {
        setCosmoMood('happy');
        setIsSpeaking(false);
      }, 5000);

    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! My brain got a little fuzzy there 🤖 Can you try again?",
        mood: 'thinking',
      };
      setMessages(prev => [...prev, errMsg]);
      setCosmoMood('thinking');
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [input, loading, messages]);

  const toggleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speak(text);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 6000);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowCosmo]}>
        {!isUser && (
          <View style={styles.cosmoAvatar}>
            <Text style={styles.cosmoAvatarEmoji}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCosmo]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextCosmo]}>
            {item.content}
          </Text>
          {!isUser && Platform.OS === 'web' && (
            <TouchableOpacity
              style={styles.speakBtn}
              onPress={() => toggleSpeak(item.content)}
            >
              <Ionicons
                name={isSpeaking ? 'volume-mute' : 'volume-medium'}
                size={14}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2B0050', '#7B2FAE', '#FF3CAC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Animated.View style={{ transform: [{ scale: cosmoScale }] }}>
            <Cosmo mood={cosmoMood} size={72} animate />
          </Animated.View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Talk to Cosmo!</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>
                {loading ? 'Cosmo is thinking...' : isSpeaking ? 'Cosmo is speaking...' : 'Ready to chat!'}
              </Text>
            </View>
          </View>
        </View>
        {Platform.OS === 'web' && (
          <TouchableOpacity style={styles.speakToggleBtn} onPress={() => stopSpeaking()}>
            <Ionicons name="volume-off" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={loading ? (
          <View style={styles.typingRow}>
            <View style={styles.cosmoAvatar}>
              <Text style={styles.cosmoAvatarEmoji}>🤖</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.typingText}>Cosmo is thinking...</Text>
            </View>
          </View>
        ) : null}
      />

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <View style={styles.quickSection}>
          <Text style={styles.quickLabel}>Quick ideas 👇</Text>
          <FlatList
            horizontal
            data={QUICK_PROMPTS}
            keyExtractor={item => item.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => sendMessage(item.message)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Ask Cosmo anything! 🌟"
            placeholderTextColor={COLORS.textLight}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={400}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF3CAC', '#FF7043']}
              style={styles.sendBtnGradient}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="send" size={20} color="#fff" />
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.extrabold,
    color: '#fff',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF9D',
  },
  onlineText: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  speakToggleBtn: {
    padding: SPACING.sm,
  },

  // Messages
  messageList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowCosmo: {
    justifyContent: 'flex-start',
  },
  cosmoAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0E0FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cosmoAvatarEmoji: {
    fontSize: 20,
  },
  bubble: {
    maxWidth: SCREEN_WIDTH * 0.72,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.small,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleCosmo: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: '#F0E0FF',
  },
  bubbleText: {
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#fff',
    fontWeight: FONTS.weights.medium,
  },
  bubbleTextCosmo: {
    color: COLORS.text,
  },
  speakBtn: {
    marginTop: 6,
    alignSelf: 'flex-end',
  },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#F0E0FF',
  },
  typingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  // Quick prompts
  quickSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  quickLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  quickList: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  quickChip: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    ...SHADOWS.small,
  },
  quickChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
  },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
