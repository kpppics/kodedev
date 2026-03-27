// ==========================================
// COSMO CHAT — Talk to your AI buddy!
// Kid-safe AI tutor: voice input, TTS output,
// intent mapping (local-first), then API fallback
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

// ── Intent Mapping (local-first, no API call needed) ──────────
// Spec requirement: map common inputs to safe local responses.
// Only call API when no intent matches.

interface IntentResponse {
  reply: string;
  mood: CosmoMood;
}

const INTENT_MAP: Array<{ patterns: RegExp[]; response: () => IntentResponse }> = [
  {
    patterns: [/hello|hi|hey|howdy/i, /^(hi|hey|hello)[\s!.]*$/i],
    response: () => ({
      reply: "Hey hey hey! 🎉 So glad you're here! What awesome thing shall we make today?",
      mood: 'happy',
    }),
  },
  {
    patterns: [/what.*your name|who are you/i],
    response: () => ({
      reply: "I'm Cosmo — your friendly AI robot buddy! 🤖✨ I love helping kids learn, create, and have FUN!",
      mood: 'waving',
    }),
  },
  {
    patterns: [/how are you|are you okay|you good/i],
    response: () => ({
      reply: "AMAZING! 🚀 I just had a software upgrade and now I can do 1000 jumps per second! Want to make something cool?",
      mood: 'excited',
    }),
  },
  {
    patterns: [/joke|funny|laugh|haha/i],
    response: () => {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🐛😂",
        "What did the computer say to the sandwich? Byte me! 🥪💻",
        "Why was the math book sad? It had too many problems! 📚😄",
        "What do you call a sleeping dinosaur? A dino-snore! 🦕💤",
      ];
      return { reply: jokes[Math.floor(Math.random() * jokes.length)], mood: 'celebrating' };
    },
  },
  {
    patterns: [/thank|thanks|thank you/i],
    response: () => ({
      reply: "You're SO welcome! 🌟 That's what I'm here for! Any other questions, superstar?",
      mood: 'happy',
    }),
  },
  {
    patterns: [/goodbye|bye|see you|later/i],
    response: () => ({
      reply: "See you later, space explorer! 🚀 Come back soon — I'll miss you! 💙",
      mood: 'waving',
    }),
  },
  {
    patterns: [/what is coding|what is programming|what does code mean/i],
    response: () => ({
      reply: "Coding is like giving a robot instructions using a special language! 🤖 You tell the computer exactly what to do — and it does it! It's like magic, but YOU are the wizard! ✨",
      mood: 'excited',
    }),
  },
  {
    patterns: [/what is (a )?loop/i],
    response: () => ({
      reply: "A loop tells the computer: 'Do this thing OVER AND OVER!' 🔄 Like if you told a robot: 'Jump 10 times!' Instead of writing 'Jump!' 10 times, you write one loop. Super clever! 💡",
      mood: 'thinking',
    }),
  },
  {
    patterns: [/what is (an? )?if|what is a condition/i],
    response: () => ({
      reply: "An IF statement is like a decision! 🤔 Like: IF it's raining, take an umbrella. IF not, wear sunglasses! Computers use IF to make smart decisions too! 🌂☀️",
      mood: 'thinking',
    }),
  },
  {
    patterns: [/what is (a )?variable/i],
    response: () => ({
      reply: "A variable is like a magic box that holds information! 📦 You can name it anything — like `score = 100`. Then whenever you need that number, you just say 'score'! The box remembers for you! 🧠",
      mood: 'excited',
    }),
  },
];

/**
 * Try to match the message against local intents.
 * Returns a response if matched, null otherwise.
 */
function matchIntent(message: string): IntentResponse | null {
  for (const intent of INTENT_MAP) {
    if (intent.patterns.some(p => p.test(message))) {
      return intent.response();
    }
  }
  return null;
}

// ── TTS helper (Web Speech API) ───────────────────────────────
function speak(text: string) {
  if (Platform.OS !== 'web') return;
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.2;
      utterance.volume = 1;
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

// ── STT helper (Web Speech API) ───────────────────────────────
// Returns a cleanup fn; calls onResult when speech is detected
function startListening(
  onResult: (text: string) => void,
  onEnd: () => void,
  onError: () => void,
): (() => void) | null {
  if (Platform.OS !== 'web') return null;
  try {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) onResult(transcript.trim());
    };
    recognition.onend = onEnd;
    recognition.onerror = onError;
    recognition.start();

    return () => { try { recognition.stop(); } catch {} };
  } catch {
    return null;
  }
}

// ── Static data ───────────────────────────────────────────────

const COSMO_OPENERS = [
  "Hi there, superstar! 🌟 I'm Cosmo, your AI learning buddy! Tap the mic 🎤 or type — ask me ANYTHING!",
  "Hey hey hey! 🚀 Cosmo here! You can TALK to me — just tap that mic button! What shall we create today?",
  "WOOHOO! 🎉 My favourite human is here! Tap 🎤 to chat with your voice, or just type away!",
  "Hello, future genius! 💡 I'm Cosmo! Did you know you can SPEAK to me? Try the mic button! 🎤",
];

const QUICK_PROMPTS = [
  { label: '📖 Tell me a story', message: 'Tell me a fun short story about a kid who discovers a hidden world!' },
  { label: '🎮 Game ideas', message: 'What makes a really fun game? Give me some ideas!' },
  { label: '🎨 Art project', message: 'Give me 3 creative art project ideas I can make today!' },
  { label: '💻 What is coding?', message: 'What is coding?' },
  { label: '🤔 What is a loop?', message: 'What is a loop?' },
  { label: '🌍 Fun fact!', message: 'Tell me the most amazing science fact you know!' },
];

// ── Component ─────────────────────────────────────────────────

export default function CosmoChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cosmoMood, setCosmoMood] = useState<CosmoMood>('waving');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const cosmoScale = useRef(new Animated.Value(1)).current;
  const micPulse = useRef(new Animated.Value(1)).current;
  const stopRecognitionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const opener = COSMO_OPENERS[Math.floor(Math.random() * COSMO_OPENERS.length)];
    setMessages([{ id: 'opener', role: 'assistant', content: opener, mood: 'waving' }]);
    setTimeout(() => speak(opener), 800);
    setTimeout(() => setCosmoMood('happy'), 2500);
  }, []);

  // Pulsing animation when mic is active
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(micPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      micPulse.stopAnimation();
      micPulse.setValue(1);
    }
  }, [isListening]);

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
    stopSpeaking();
    setIsSpeaking(false);

    // ── Try local intent mapping first ────────────────────────
    const localMatch = matchIntent(messageText);
    if (localMatch) {
      setCosmoMood(localMatch.mood);
      animateCosmo();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: localMatch.reply,
        mood: localMatch.mood,
      };
      setMessages(prev => [...prev, assistantMsg]);
      speak(localMatch.reply);
      setIsSpeaking(true);
      setTimeout(() => { setCosmoMood('happy'); setIsSpeaking(false); }, 5000);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    // ── Fallback: call the API ─────────────────────────────────
    setLoading(true);
    setCosmoMood('thinking');
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
      speak(response.reply);
      setIsSpeaking(true);
      setTimeout(() => { setCosmoMood('happy'); setIsSpeaking(false); }, 5000);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! My brain got a little fuzzy there 🤖 Can you try again?",
        mood: 'thinking',
      }]);
      setCosmoMood('thinking');
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [input, loading, messages]);

  const handleVoiceInput = useCallback(() => {
    if (isListening) {
      // Stop listening
      stopRecognitionRef.current?.();
      stopRecognitionRef.current = null;
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setCosmoMood('thinking');

    const stop = startListening(
      (transcript) => {
        setIsListening(false);
        stopRecognitionRef.current = null;
        sendMessage(transcript);
      },
      () => {
        setIsListening(false);
        stopRecognitionRef.current = null;
        setCosmoMood('happy');
      },
      () => {
        setIsListening(false);
        stopRecognitionRef.current = null;
        setCosmoMood('happy');
      },
    );

    if (!stop) {
      // Browser doesn't support STT
      setIsListening(false);
      setCosmoMood('happy');
      setInput('(Voice not supported on this browser — try typing!)');
    } else {
      stopRecognitionRef.current = stop;
    }
  }, [isListening, sendMessage]);

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
            <TouchableOpacity style={styles.speakBtn} onPress={() => toggleSpeak(item.content)}>
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

  const voiceSupported = Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    !!(((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));

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
              <View style={[styles.onlineDot, isListening && styles.onlineDotListening]} />
              <Text style={styles.onlineText}>
                {isListening
                  ? '🎤 Listening...'
                  : loading
                  ? 'Cosmo is thinking...'
                  : isSpeaking
                  ? 'Cosmo is speaking...'
                  : 'Ready to chat!'}
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

      {/* Quick prompts (shown only at start) */}
      {messages.length <= 1 && (
        <View style={styles.quickSection}>
          <Text style={styles.quickLabel}>
            {voiceSupported ? 'Tap 🎤 to speak, or try a quick idea 👇' : 'Quick ideas 👇'}
          </Text>
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

      {/* Listening overlay hint */}
      {isListening && (
        <View style={styles.listeningBanner}>
          <Animated.View style={[styles.micPulseRing, { transform: [{ scale: micPulse }] }]} />
          <Ionicons name="mic" size={20} color={COLORS.primary} />
          <Text style={styles.listeningText}>Listening… speak now!</Text>
        </View>
      )}

      {/* Input area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          {/* Voice button */}
          {voiceSupported && (
            <Animated.View style={{ transform: [{ scale: micPulse }] }}>
              <TouchableOpacity
                style={[styles.micBtn, isListening && styles.micBtnActive]}
                onPress={handleVoiceInput}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isListening ? 'mic' : 'mic-outline'}
                  size={22}
                  color={isListening ? '#fff' : COLORS.primary}
                />
              </TouchableOpacity>
            </Animated.View>
          )}

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={voiceSupported ? 'Type or tap 🎤 to speak…' : 'Ask Cosmo anything! 🌟'}
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
            <LinearGradient colors={['#FF3CAC', '#FF7043']} style={styles.sendBtnGradient}>
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerCenter: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.extrabold, color: '#fff',
  },
  onlineRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2,
  },
  onlineDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF9D',
  },
  onlineDotListening: {
    backgroundColor: '#FF3CAC',
  },
  onlineText: {
    fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)',
  },
  speakToggleBtn: { padding: SPACING.sm },

  // Messages
  messageList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  messageRow: {
    flexDirection: 'row', marginBottom: SPACING.md, alignItems: 'flex-end', gap: SPACING.sm,
  },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowCosmo: { justifyContent: 'flex-start' },
  cosmoAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F0E0FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cosmoAvatarEmoji: { fontSize: 20 },
  bubble: {
    maxWidth: SCREEN_WIDTH * 0.72, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, ...SHADOWS.small,
  },
  bubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleCosmo: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1.5, borderColor: '#F0E0FF' },
  bubbleText: { fontSize: FONTS.sizes.md, lineHeight: 22 },
  bubbleTextUser: { color: '#fff', fontWeight: FONTS.weights.medium },
  bubbleTextCosmo: { color: COLORS.text },
  speakBtn: { marginTop: 6, alignSelf: 'flex-end' },

  // Typing indicator
  typingRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.md, paddingHorizontal: SPACING.md,
  },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#fff', borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderWidth: 1.5, borderColor: '#F0E0FF',
  },
  typingText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontStyle: 'italic' },

  // Quick prompts
  quickSection: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  quickLabel: {
    fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary, marginBottom: SPACING.sm,
  },
  quickList: { gap: SPACING.sm, paddingRight: SPACING.lg },
  quickChip: {
    backgroundColor: '#fff', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderWidth: 2, borderColor: COLORS.primary + '40', ...SHADOWS.small,
  },
  quickChipText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, color: COLORS.primary },

  // Listening banner
  listeningBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary + '12',
    marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, marginBottom: SPACING.sm,
  },
  micPulseRing: {
    position: 'absolute', width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary + '25',
  },
  listeningText: {
    fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.primary,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.md,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  micBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    borderWidth: 2, borderColor: COLORS.primary + '40',
  },
  micBtnActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    backgroundColor: COLORS.background, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md, color: COLORS.text,
    borderWidth: 2, borderColor: COLORS.border,
  },
  sendBtn: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', flexShrink: 0 },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
