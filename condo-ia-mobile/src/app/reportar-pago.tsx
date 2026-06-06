import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { API_URL } from "../constants/api";

export default function ReportarPagoScreen() {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !reference) {
      Alert.alert("Error", "Por favor ingresa todos los campos");
      return;
    }

    setLoading(true);
    try {
      // Endpoint ajustado a la ruta real de tu backend.
      // Enviamos un invoiceId quemado para pruebas, en el futuro esto vendrá de las props.
      const response = await fetch(API_URL("/api/payments/report"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ 
          invoiceId: "dummy-invoice-123", // Reemplazar luego con ID real
          amount: parseFloat(amount), 
          referenceNumber: reference 
        }),
      });

      if (response.ok) {
        Alert.alert("Éxito", "Pago reportado correctamente");
        router.back();
      } else {
        Alert.alert("Error", "No se pudo reportar el pago");
      }
    } catch (e) {
      Alert.alert("Error", "Falla de conexión con el servidor");
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
        <Text style={styles.headerTitle}>Reportar Pago</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Monto del Pago ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 125.00"
          placeholderTextColor="#8a8a9d"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Número de Referencia</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 123456789"
          placeholderTextColor="#8a8a9d"
          value={reference}
          onChangeText={setReference}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Enviar Reporte</Text>
          )}
        </TouchableOpacity>
      </View>
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
  formContainer: { padding: 30 },
  label: {
    color: "#8a8a9d",
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#1e1e38",
    color: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    fontSize: 16,
    marginBottom: 25,
  },
  submitButton: {
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
