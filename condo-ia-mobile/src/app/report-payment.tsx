import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

export default function ReportPaymentScreen() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOcr, setLoadingOcr] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    if (!user) return;
    try {
      const res = await fetch(`https://condoia-api-2026.loca.lt/api/invoices/pending/${user.id}`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      const data = await res.json();
      setInvoices(data);
      if (data.length > 0) {
        setSelectedInvoiceId(data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true, // Importante para enviar a Gemini
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      processOcr(result.assets[0].base64);
    }
  };

  const processOcr = async (base64Image: string) => {
    setLoadingOcr(true);
    try {
      const response = await fetch('https://condoia-api-2026.loca.lt/api/payments/ocr', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({ base64Image }),
      });
      
      const data = await response.json();
      if (data.referenceNumber) setReferenceNumber(data.referenceNumber);
      if (data.amount) setAmount(data.amount.toString());
      
      Alert.alert('¡Magia IA!', 'Hemos extraído los datos del comprobante. Revisa que estén correctos.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo leer el comprobante automáticamente.');
    } finally {
      setLoadingOcr(false);
    }
  };

  const submitPayment = async () => {
    if (!selectedInvoiceId || !referenceNumber || !amount) {
      Alert.alert('Error', 'Por favor llena todos los campos o escanea un comprobante.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://condoia-api-2026.loca.lt/api/payments/report', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({ 
          invoiceId: selectedInvoiceId, 
          amount: parseFloat(amount), 
          referenceNumber 
        }),
      });

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Tu pago ha sido reportado y está en revisión por la junta.', [
          { text: 'Volver', onPress: () => router.back() }
        ]);
      } else {
        throw new Error('Fallo al reportar');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema enviando el reporte.');
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
        <Text style={styles.headerTitle}>Reportar Pago</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <TouchableOpacity style={styles.ocrButton} onPress={pickImage} disabled={loadingOcr}>
          {loadingOcr ? (
            <ActivityIndicator color="#10b981" />
          ) : (
            <>
              <Ionicons name="scan" size={24} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={styles.ocrButtonText}>Escanear Comprobante con IA</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.ocrHelp}>La IA extraerá el monto y la referencia automáticamente, y luego la foto será desechada.</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Factura a Pagar</Text>
        {invoices.length === 0 ? (
          <Text style={styles.noInvoices}>No tienes facturas pendientes 🎉</Text>
        ) : (
          <View style={styles.invoiceList}>
            {invoices.map(inv => (
              <TouchableOpacity 
                key={inv.id} 
                style={[styles.invoiceCard, selectedInvoiceId === inv.id && styles.invoiceCardSelected]}
                onPress={() => setSelectedInvoiceId(inv.id)}
              >
                <Text style={styles.invoiceTitle}>Apto {inv.unit.unitNumber}</Text>
                <Text style={styles.invoiceAmount}>${inv.totalAmount.toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
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
          style={[styles.submitButton, (!selectedInvoiceId || loading) && styles.submitButtonDisabled]} 
          onPress={submitPayment}
          disabled={!selectedInvoiceId || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Enviar Reporte</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050512' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e1e38' },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 24 },
  ocrButton: {
    flexDirection: 'row',
    backgroundColor: '#10b98120',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ocrButtonText: { color: '#10b981', fontSize: 16, fontWeight: 'bold' },
  ocrHelp: { color: '#64748b', fontSize: 12, textAlign: 'center', marginBottom: 24 },
  divider: { height: 1, backgroundColor: '#1e1e38', marginBottom: 24 },
  label: { color: '#e2e8f0', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  noInvoices: { color: '#10b981', marginBottom: 24 },
  invoiceList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  invoiceCard: { 
    backgroundColor: '#1e1e38', 
    borderRadius: 12, 
    padding: 16, 
    marginRight: 12, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  invoiceCardSelected: { borderColor: '#c084fc', backgroundColor: '#c084fc20' },
  invoiceTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  invoiceAmount: { color: '#c084fc', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  input: {
    backgroundColor: '#1e1e38',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  submitButton: {
    backgroundColor: '#c084fc',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
