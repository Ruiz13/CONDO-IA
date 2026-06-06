import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../constants/api";

export default function AnnouncementsScreen() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  const fetchAnnouncements = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        API_URL(`/api/communications/announcements/${user.tenantId}`),
        {
          headers: { "Bypass-Tunnel-Reminder": "true" },
        },
      );
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comunicados Oficiales</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color="#3b82f6" />
        ) : announcements.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#64748b"
            />
            <Text style={styles.emptyText}>No hay comunicados recientes.</Text>
          </View>
        ) : (
          announcements.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="megaphone" size={20} color="#3b82f6" />
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.content}</Text>
              {item.imageUrl && (
                <View style={styles.mediaContainer}>
                  {item.imageUrl.toLowerCase().endsWith(".pdf") ? (
                    <TouchableOpacity
                      style={styles.pdfButton}
                      onPress={() => Linking.openURL(API_URL(item.imageUrl))}
                    >
                      <Ionicons name="document-text" size={24} color="#3b82f6" />
                      <Text style={styles.pdfButtonText}>Ver PDF Adjunto</Text>
                    </TouchableOpacity>
                  ) : (
                    <Image
                      source={{ uri: API_URL(item.imageUrl) }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050512" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e38",
  },
  backButton: { marginRight: 15 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  content: { padding: 20, paddingBottom: 80 },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#64748b", marginTop: 10 },
  card: {
    backgroundColor: "#0a0a16",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e1e38",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  date: { color: "#64748b", fontSize: 12 },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  body: { color: "#94a3b8", fontSize: 14, lineHeight: 22 },
  mediaContainer: { marginTop: 16, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  image: { width: "100%", height: 250, backgroundColor: "transparent" },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e38",
    padding: 12,
    borderRadius: 8,
  },
  pdfButtonText: {
    color: "#3b82f6",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
