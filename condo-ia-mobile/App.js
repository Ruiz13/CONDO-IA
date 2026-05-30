import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header - Saldo Deudor */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tu Saldo Actual</Text>
          <Text style={styles.headerAmount}>$ 150.00</Text>
          <Text style={styles.headerSubtitle}>Vence el 05 de Diciembre</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]}>
            <Text style={styles.buttonTextPrimary}>Pagar con Tarjeta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]}>
            <Text style={styles.buttonTextSecondary}>Subir Recibo</Text>
          </TouchableOpacity>
        </View>

        {/* Comunicados Gemini */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Último Comunicado (IA)</Text>
          <View style={styles.messageCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Gemini AI</Text>
            </View>
            <Text style={styles.messageTitle}>Mantenimiento de Aguas</Text>
            <Text style={styles.messageBody}>
              Estimados residentes, se realizará un corte preventivo de agua desde las 8:00 AM hasta las 2:00 PM. Por favor, tomen sus previsiones.
            </Text>
          </View>
        </View>

        {/* Recibos Anteriores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Recibos</Text>
          <View style={styles.receiptItem}>
            <View>
              <Text style={styles.receiptMonth}>Octubre 2023</Text>
              <Text style={styles.receiptRef}>Ref: #882103</Text>
            </View>
            <Text style={styles.statusPaid}>Al Día</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e293b' },
  scrollContent: { padding: 20 },
  header: { 
    alignItems: 'center', 
    padding: 30, 
    backgroundColor: '#3b82f6', 
    borderRadius: 20,
    marginBottom: -20,
    zIndex: 1 
  },
  headerTitle: { color: '#bfdbfe', fontSize: 16 },
  headerAmount: { color: '#ffffff', fontSize: 40, fontWeight: 'bold', marginVertical: 8 },
  headerSubtitle: { color: '#eff6ff', fontSize: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 5 },
  buttonPrimary: { backgroundColor: '#ffffff', marginRight: 8 },
  buttonTextPrimary: { color: '#1e40af', fontWeight: 'bold' },
  buttonSecondary: { backgroundColor: '#334155', marginLeft: 8 },
  buttonTextSecondary: { color: '#ffffff', fontWeight: 'bold' },
  section: { marginTop: 30 },
  sectionTitle: { color: '#94a3b8', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  messageCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, position: 'relative' },
  badge: { position: 'absolute', top: -10, right: 16, backgroundColor: '#ec4899', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  messageTitle: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  messageBody: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },
  receiptItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 },
  receiptMonth: { color: '#f8fafc', fontSize: 16, fontWeight: '500' },
  receiptRef: { color: '#64748b', fontSize: 12, marginTop: 4 },
  statusPaid: { color: '#10b981', fontWeight: 'bold' }
});
