import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([
    { id: '1', text: '¡Hola! Soy tu asistente virtual Condo IA. ¿En qué puedo ayudarte hoy?', isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    if (user?.id) fetchHistory();
  }, [user?.id]);

  // Scroll al fondo cada vez que llega un mensaje nuevo
  React.useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(API_URL(`/api/chat/${user?.id}`));
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setMessages(data.map((m: any) => ({ id: m.id, text: m.text, isBot: m.isBot })));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'Mensaje copiado al portapapeles');
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), text: inputText.trim(), isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(API_URL('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsg.text, userId: user?.id }),
      });
      const data = await response.json();
      const botMsg = { id: (Date.now() + 1).toString(), text: data.response, isBot: true };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: '❌ Error de conexión. Intenta nuevamente.',
        isBot: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Formato de hora
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header estilo WhatsApp */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Ionicons name="sparkles" size={20} color="#c084fc" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Asistente Condo IA</Text>
          <Text style={styles.headerSubtitle}>Gemini · en línea</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Lista de mensajes */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.isBot ? styles.messageRowLeft : styles.messageRowRight
              ]}
            >
              <TouchableOpacity 
                activeOpacity={0.9} 
                onLongPress={() => copyToClipboard(msg.text)}
                style={[
                  styles.messageBubble,
                  msg.isBot ? styles.botBubble : styles.userBubble
                ]}
              >
                {/* Texto completo del mensaje — sin truncar y seleccionable */}
                <Text selectable={true} style={msg.isBot ? styles.botText : styles.userText}>
                  {msg.text}
                </Text>
                <Text style={[
                  styles.timeText,
                  { textAlign: msg.isBot ? 'left' : 'right' }
                ]}>
                  {timeStr}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Indicador "escribiendo..." */}
          {loading && (
            <View style={styles.messageRow}>
              <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                <ActivityIndicator color="#c084fc" size="small" />
                <Text style={[styles.botText, { marginLeft: 8 }]}>Escribiendo...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input multilinea estilo WhatsApp */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu consulta..."
              placeholderTextColor="#8a8a9d"
              value={inputText}
              onChangeText={setInputText}
              multiline={true}          // ← Permite múltiples líneas
              numberOfLines={4}         // ← Máximo visible antes de hacer scroll interno
              maxLength={1000}
              textAlignVertical="top"   // ← Texto empieza desde arriba
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050512' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e38',
    backgroundColor: '#0a0a1a',
  },
  backButton: { marginRight: 12 },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2d1b4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#c084fc40',
  },
  headerInfo: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  headerSubtitle: { color: '#c084fc', fontSize: 12, marginTop: 2 },

  // Mensajes
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    marginBottom: 8,
  },
  messageRowLeft: {
    alignItems: 'flex-start',
  },
  messageRowRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  botBubble: {
    backgroundColor: '#1a1a35',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2a2a50',
  },
  userBubble: {
    backgroundColor: '#7c3aed',
    borderTopRightRadius: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  botText: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 22,
    flexShrink: 1,   // ← clave: el texto se expande verticalmente, no en una línea
  },
  userText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
    flexShrink: 1,   // ← clave: el texto se expande verticalmente
  },
  timeText: {
    color: '#ffffff60',
    fontSize: 11,
    marginTop: 4,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: '#1e1e38',
    backgroundColor: '#0a0a1a',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#1e1e38',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2a2a50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 46,
    maxHeight: 140,   // ← crece hasta 6 líneas aprox., luego hace scroll interno
    justifyContent: 'center',
  },
  input: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 21,
    padding: 0,
    margin: 0,
  },
  sendButton: {
    backgroundColor: '#c084fc',
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#4a4a6a',
    shadowOpacity: 0,
  },
});
