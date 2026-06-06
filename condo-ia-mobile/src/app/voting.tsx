import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../constants/api";

export default function VotingScreen() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
  }, [user]);

  const fetchPolls = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        API_URL(`/api/communications/polls/${user.tenantId}`),
        {
          headers: { "Bypass-Tunnel-Reminder": "true" },
        },
      );
      const data = await res.json();
      setPolls(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (pollId: string, optionId: string) => {
    try {
      if (!user?.id) {
        if (typeof window !== 'undefined') window.alert("Error: Usuario no válido");
        else Alert.alert("Error", "Usuario no válido");
        return;
      }

      const res = await fetch(
        API_URL(`/api/communications/polls/${pollId}/vote`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Bypass-Tunnel-Reminder": "true",
          },
          body: JSON.stringify({ optionId, userId: user.id }),
        },
      );

      if (res.ok) {
        if (typeof window !== 'undefined') window.alert("¡Tu voto ha sido contabilizado con éxito!");
        else Alert.alert("Voto Registrado", "Tu voto ha sido contabilizado con éxito.");
        fetchPolls(); // Refresh to show updated votes
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (typeof window !== 'undefined') window.alert("Solo puedes votar una vez por cada asamblea.");
        else Alert.alert("No permitido", "Solo puedes votar una vez por cada asamblea/encuesta.");
      }
    } catch (error: any) {
      if (typeof window !== 'undefined') window.alert("Error de conexión: " + error.message);
      else Alert.alert("Error", "No se pudo procesar el voto.");
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
        <Text style={styles.headerTitle}>Asambleas y Votaciones</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color="#c084fc" />
        ) : polls.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="ballot-outline"
              size={48}
              color="#64748b"
            />
            <Text style={styles.emptyText}>No hay asambleas activas.</Text>
          </View>
        ) : (
          polls.map((poll) => {
            const totalVotes = poll.options.reduce(
              (sum: number, opt: any) => sum + opt._count.votes,
              0,
            );

            return (
              <View key={poll.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="vote"
                    size={24}
                    color="#c084fc"
                  />
                  <Text style={styles.date}>
                    {new Date(poll.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.question}>{poll.question}</Text>

                <View style={styles.optionsContainer}>
                  {poll.options.map((option: any) => {
                    const percentage =
                      totalVotes === 0
                        ? 0
                        : Math.round((option._count.votes / totalVotes) * 100);
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={styles.optionBtn}
                        onPress={() => castVote(poll.id, option.id)}
                      >
                        <View style={styles.optionRow}>
                          <Text style={styles.optionText}>{option.text}</Text>
                          <Text style={styles.percentText}>
                            {percentage}% ({option._count.votes})
                          </Text>
                        </View>
                        {/* Progress Bar background */}
                        <View
                          style={[
                            styles.progressBar,
                            { width: `${percentage}%` },
                          ]}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.totalVotes}>
                  {totalVotes} votos emitidos
                </Text>
              </View>
            );
          })
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
  content: { padding: 20 },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#64748b", marginTop: 10 },
  card: {
    backgroundColor: "#0a0a16",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  question: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionsContainer: { gap: 12 },
  optionBtn: {
    backgroundColor: "#1e1e38",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#334155",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    zIndex: 2, // Keep text above progress bar
  },
  optionText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  percentText: { color: "#c084fc", fontSize: 14, fontWeight: "bold" },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "#c084fc30",
    zIndex: 1,
  },
  totalVotes: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
  },
});
