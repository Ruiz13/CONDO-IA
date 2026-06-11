import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/api";

export default function ChangePasswordScreen() {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangeProfile = async () => {
    if (!email.trim() || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL("/api/auth/update-profile"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ 
          userId: user?.id, 
          newEmail: email.trim().toLowerCase(), 
          newPassword 
        }),
      });

      if (!response.ok) {
        let errorMsg = "No se pudo actualizar la cuenta";
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const resData = await response.json();

      // Update the context and AsyncStorage so we can navigate to the main dashboard
      await updateUser({ 
        email: resData.user.email,
        mustChangePassword: false 
      });

      Alert.alert("Éxito", "Tu cuenta ha sido configurada y guardada correctamente.", [
        { text: "Ir al Inicio", onPress: () => router.replace("/") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Error al conectar con el servidor",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Ionicons
            name="shield-checkmark"
            size={60}
            color="#10b981"
            style={styles.logo}
          />
          <Text style={styles.title}>Seguridad</Text>
          <Text style={styles.subtitle}>
            Configura tu correo definitivo y tu nueva contraseña para activar tu cuenta.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu correo"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())}
          />

          <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
          <TextInput
            style={styles.input}
            placeholder="Nueva Contraseña"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleChangeProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Actualizar y Activar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  headerContainer: { alignItems: "center", marginBottom: 40 },
  logo: { marginBottom: 16 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: { width: "100%" },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  label: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: "#059669", opacity: 0.7 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
