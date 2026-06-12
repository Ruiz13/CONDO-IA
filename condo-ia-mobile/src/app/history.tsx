import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';

type Payment = {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  referenceNumber: string;
  createdAt: string;
  unit: {
    unitNumber: string;
  }
};

export default function HistoryScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(API_URL(`/api/payments/user/${user?.id}`));
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#10b981'; // Green
      case 'REJECTED': return '#ef4444'; // Red
      case 'PENDING': default: return '#fbbf24'; // Yellow
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Aprobado';
      case 'REJECTED': return 'Rechazado';
      case 'PENDING': default: return 'En Revisión';
    }
  };

  const renderItem = ({ item }: { item: Payment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.monthText}>Apto {item.unit?.unitNumber} - {new Date(item.createdAt).toLocaleDateString()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View>
          <Text style={styles.label}>Referencia</Text>
          <Text style={styles.value}>#{item.referenceNumber || 'N/A'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.label}>Monto</Text>
          <Text style={styles.amountValue}>${item.amount.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Pagos</Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#c084fc" />
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="receipt-outline" size={60} color="#1e1e38" />
          <Text style={styles.emptyText}>No tienes pagos registrados aún.</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050512' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e1e38' },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#8a8a9d', marginTop: 15, fontSize: 16 },
  listContainer: { padding: 20 },
  card: { backgroundColor: '#0a0a16', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#1e1e38' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1e1e38' },
  monthText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#8a8a9d', fontSize: 12, textTransform: 'uppercase', marginBottom: 5 },
  value: { color: '#fff', fontSize: 15 },
  amountValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
