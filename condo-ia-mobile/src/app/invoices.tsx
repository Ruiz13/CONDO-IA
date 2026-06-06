import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';

type Invoice = {
  id: string;
  totalAmount: number;
  status: string;
  month: number;
  year: number;
  createdAt: string;
};

export default function InvoicesScreen() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(API_URL(`/api/invoices/user/${user.id}`), {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
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
      case 'PAID': return 'Pagado';
      case 'PENDING': return 'Pendiente';
      case 'PARTIAL': return 'Pago Parcial';
      default: return status;
    }
  };

  const renderItem = ({ item }: { item: Invoice }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.monthText}>Mes {item.month}/{item.year}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View>
          <Text style={styles.label}>Emisión</Text>
          <Text style={styles.value}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.label}>Total Facturado</Text>
          <Text style={styles.amountValue}>${item.totalAmount.toFixed(2)}</Text>
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
        <Text style={styles.headerTitle}>Mis Facturas</Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#c084fc" />
        </View>
      ) : invoices.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="document-text-outline" size={60} color="#1e1e38" />
          <Text style={styles.emptyText}>No tienes facturas generadas aún.</Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
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
