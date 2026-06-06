import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([{ id: '1', text: '¡Hola! Soy tu asistente virtual Condo IA. ¿En qué puedo ayudarte hoy?', isBot: true }]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(API_URL(`/api/chat/${user?.id}`), {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const formatted = data.map((m: any) => ({
            id: m.id,
            text: m.text,
            isBot: m.isBot
          }));
          setMessages(formatted);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), text: inputText, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(API_URL('/api/chat'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true' 
        },
        body: JSON.stringify({ message: userMsg.text, userId: user?.id }),
      });
      const data = await response.json();
      
      const botMsg = { id: (Date.now() + 1).toString(), text: data.response, isBot: true };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = { id: (Date.now() + 1).toString(), text: '❌ Error de conexión con el servidor. Revisa que el backend esté encendido.', isBot: true };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asistente Condo IA</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.chatContainer}>
          {messages.map(msg => (
            <View key={msg.id} style={[styles.messageBubble, msg.isBot ? styles.botBubble : styles.userBubble]}>
              <Text style={msg.isBot ? styles.botMessageText : styles.userMessageText}>{msg.text}</Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.messageBubble, styles.botBubble, { flexDirection: 'row', alignItems: 'center' }]}>
              <ActivityIndicator color="#c084fc" size="small" style={{ marginRight: 10 }} />
              <Text style={styles.botMessageText}>Escribiendo...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu duda..."
            placeholderTextColor="#8a8a9d"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050512' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e1e38' },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  chatContainer: { padding: 20, paddingBottom: 40 },
  messageBubble: { maxWidth: '85%', padding: 15, borderRadius: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  botBubble: { backgroundColor: '#1e1e38', alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  userBubble: { backgroundColor: '#c084fc', alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  userMessageText: { color: '#fff', fontSize: 16, lineHeight: 22 },
  botMessageText: { color: '#e2e8f0', fontSize: 16, lineHeight: 22 },
  inputContainer: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderTopColor: '#1e1e38', alignItems: 'center', paddingBottom: 30 },
  input: { flex: 1, backgroundColor: '#1e1e38', color: '#fff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, fontSize: 15 },
  sendButton: { backgroundColor: '#c084fc', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginLeft: 10, shadowColor: '#c084fc', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 5 }
});
