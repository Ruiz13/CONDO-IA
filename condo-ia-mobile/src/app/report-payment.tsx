import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../constants/api";

export default function ReportPaymentScreen() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [unitId, setUnitId] = useState("");
  
  const [referenceNumber, setReferenceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOcr, setLoadingOcr] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    if (!user) return;
    try {
      const res = await fetch(API_URL(`/api/invoices/pending/${user.id}`), {
        headers: { "Bypass-Tunnel-Reminder": "true" },
      });
      const data = await res.json();
      setInvoices(data);
      
      if (data.length > 0) {
        setUnitId(data[0].unitId);
        const debt = data.reduce((acc: number, inv: any) => acc + (inv.totalAmount - (inv.amountPaid || 0)), 0);
        setTotalDebt(debt);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert("Error", "Permiso denegado");
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true, 
        quality: 0.5, 
        base64: true
      });
      
      if (!result.canceled && result.assets && result.assets[0].base64) {
        processOcr(result.assets[0].base64);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const processOcr = async (base64Image: string) => {
    setLoadingOcr(true);
    try {
      const response = await fetch(API_URL("/api/payments/ocr"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({ base64Image }),
      });

      if (!response.ok) {
        throw new Error("El servidor rechazó la imagen. Intenta recortarla más pequeña.");
      }

      const data = await response.json();
      if (data.referenceNumber) setReferenceNumber(data.referenceNumber.toString());
      if (data.amount) setAmount(data.amount.toString());

      Alert.alert(
        "¡Magia IA!",
        `Datos extraídos con éxito.\nReferencia: ${data.referenceNumber}\nMonto: $${data.amount}\nRevisa que estén correctos.`,
      );
    } catch (error: any) {
      Alert.alert("Error OCR", error.message || "No se pudo leer el comprobante automáticamente.");
    } finally {
      setLoadingOcr(false);
    }
  };

  const submitPayment = async () => {
    if (!unitId || !referenceNumber || !amount) {
      Alert.alert(
        "Error",
        "Por favor llena todos los campos o escanea un comprobante.",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL("/api/payments/report"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({
          unitId,
          amount: parseFloat(amount),
          referenceNumber,
        }),
      });

      if (response.ok) {
        Alert.alert(
          "¡Éxito!",
          "Tu pago ha sido reportado y está en revisión."
        );
        setTimeout(() => {
          router.back();
        }, 500);
      } else {
        throw new Error("Fallo al reportar");
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema enviando el reporte.");
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

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.ocrButton}
          onPress={pickImage}
          disabled={loadingOcr}
        >
          {loadingOcr ? (
            <ActivityIndicator color="#10b981" />
          ) : (
            <>
              <Ionicons
                name="scan"
                size={24}
                color="#10b981"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.ocrButtonText}>
                Escanear Comprobante con IA
              </Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.ocrHelp}>
          La IA extraerá el monto y la referencia automáticamente, y luego la
          foto será desechada.
        </Text>

        <View style={styles.divider} />

        {totalDebt === 0 ? (
          <Text style={styles.noInvoices}>
            No tienes saldo deudor pendiente 🎉
          </Text>
        ) : (
          <View style={styles.debtCard}>
            <Text style={styles.debtLabel}>Saldo Deudor Acumulado</Text>
            <Text style={styles.debtAmount}>${totalDebt.toFixed(2)}</Text>
            <Text style={styles.debtHelp}>
              Puedes pagar el monto total o realizar un pago parcial.
            </Text>
          </View>
        )}

        <Text style={styles.label}>Número de Referencia</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 123456789"
          placeholderTextColor="#64748b"
          value={referenceNumber}
          onChangeText={setReferenceNumber}
        />

        <Text style={styles.label}>Monto Transferido</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 150.00"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!unitId || loading) && styles.submitButtonDisabled,
          ]}
          onPress={submitPayment}
          disabled={!unitId || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Reporte</Text>
          )}
        </TouchableOpacity>
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
  content: { padding: 24 },
  ocrButton: {
    flexDirection: "row",
    backgroundColor: "#10b98120",
    borderColor: "#10b981",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  ocrButtonText: { color: "#10b981", fontSize: 16, fontWeight: "bold" },
  ocrHelp: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
  },
  divider: { height: 1, backgroundColor: "#1e1e38", marginBottom: 24 },
  label: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noInvoices: { color: "#10b981", marginBottom: 24, fontSize: 16, textAlign: 'center' },
  debtCard: {
    backgroundColor: "#c084fc15",
    borderWidth: 1,
    borderColor: "#c084fc",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  debtLabel: {
    color: "#e2e8f0",
    fontSize: 14,
    marginBottom: 8,
  },
  debtAmount: {
    color: "#c084fc",
    fontSize: 32,
    fontWeight: "bold",
  },
  debtHelp: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1e1e38",
    borderRadius: 12,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  submitButton: {
    backgroundColor: "#c084fc",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
