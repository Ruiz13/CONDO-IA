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
  Image,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!response.ok) {
        // Mostrar el mensaje real del servidor
        let errorMsg = "Credenciales inválidas";
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      await login(data.access_token, data.user);

      // Si debe cambiar contraseña, redirigir a esa pantalla
      if (data.user.mustChangePassword) {
        router.replace("/change-password");
      } else {
        router.replace("/");
      }
    } catch (error: any) {
      Alert.alert(
        "Acceso Denegado",
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
          <Image
            source={require("../../assets/images/logo-glow.png")}
            style={{ width: 250, height: 110, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            Inicia sesión para gestionar tu condominio
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())}
          />
          {/* Pista del formato de correo */}
          <Text style={styles.emailHint}>
            💡 Ej: apto1-1@residenciasimolatorreb.com
          </Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor="#64748b"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() =>
              Alert.alert(
                "Recuperar contraseña",
                "Por favor contacta al administrador de tu edificio para recuperar o restablecer tu contraseña.",
              )
            }
          >
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
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
  subtitle: { fontSize: 16, color: "#94a3b8", textAlign: "center" },
  formContainer: { width: "100%" },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  emailHint: {
    color: "#3b82f6",
    fontSize: 12,
    marginBottom: 14,
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
  },
  eyeIcon: { padding: 16 },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: "#1d4ed8", opacity: 0.7 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  forgotPassword: { marginTop: 24, alignItems: "center" },
  forgotPasswordText: { color: "#3b82f6", fontSize: 14, fontWeight: "600" },
});
