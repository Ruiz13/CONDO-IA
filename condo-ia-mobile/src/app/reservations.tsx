import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const AREAS = [
  { id: 'POOL', name: 'Piscina', icon: 'water' },
  { id: 'GYM', name: 'Gimnasio', icon: 'barbell' },
  { id: 'PARTY_ROOM', name: 'Salón de Fiestas', icon: 'party-horn' }, // ionic doesn't have party-horn, let's use balloon or wine
];

export default function ReservationsScreen() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedArea, setSelectedArea] = useState('POOL');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const fetchReservations = async () => {
    try {
      const res = await fetch(API_URL('/api/reservations'), {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleRequest = async () => {
    if (!user?.token) return;
    setSubmitting(true);
    try {
      const res = await fetch(API_URL('/api/reservations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          area: selectedArea,
          date: date.toISOString()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.message || 'Error al solicitar reserva');
      } else {
        Alert.alert('Éxito', 'Reserva solicitada correctamente');
        fetchReservations();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      default: return '#fbbf24';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Aprobada';
      case 'REJECTED': return 'Rechazada';
      default: return 'Pendiente';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservas</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Solicitar Nueva Reserva</Text>
          
          <Text style={styles.label}>Selecciona un Área:</Text>
          <View style={styles.areasRow}>
            {AREAS.map(area => (
              <TouchableOpacity
                key={area.id}
                style={[styles.areaBtn, selectedArea === area.id && styles.areaBtnActive]}
                onPress={() => setSelectedArea(area.id)}
              >
                <Ionicons 
                  name={area.id === 'PARTY_ROOM' ? 'wine' : (area.id === 'GYM' ? 'barbell' : 'water')} 
                  size={24} 
                  color={selectedArea === area.id ? '#ffffff' : '#8a8a9d'} 
                />
                <Text style={[styles.areaText, selectedArea === area.id && { color: '#ffffff' }]}>
                  {area.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Selecciona la Fecha:</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#ffffff" />
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity 
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
            onPress={handleRequest}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.submitGradient}>
                <Text style={styles.submitBtnText}>Solicitar Reserva</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Mis Reservas</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
        ) : reservations.length === 0 ? (
          <Text style={styles.emptyText}>No tienes reservas solicitadas.</Text>
        ) : (
          reservations.map((res: any) => (
            <View key={res.id} style={styles.resCard}>
              <View>
                <Text style={styles.resArea}>{AREAS.find(a => a.id === res.area)?.name || res.area}</Text>
                <Text style={styles.resDate}>{new Date(res.date).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getStatusColor(res.status) + '20' }]}>
                <Text style={[styles.badgeText, { color: getStatusColor(res.status) }]}>
                  {getStatusText(res.status)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050512' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#1e1e38', borderRadius: 20, padding: 20 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  label: { color: '#8a8a9d', fontSize: 14, marginBottom: 10 },
  areasRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  areaBtn: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2d2d4a', marginHorizontal: 4 },
  areaBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  areaText: { color: '#8a8a9d', fontSize: 12, marginTop: 5, textAlign: 'center' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2d2d4a', padding: 15, borderRadius: 10, marginBottom: 20 },
  dateText: { color: '#ffffff', fontSize: 16, marginLeft: 10 },
  submitBtn: { borderRadius: 10, overflow: 'hidden' },
  submitGradient: { padding: 15, alignItems: 'center' },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  emptyText: { color: '#8a8a9d', textAlign: 'center', marginTop: 20 },
  resCard: { backgroundColor: '#1e1e38', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resArea: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  resDate: { color: '#8a8a9d', fontSize: 14, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: 'bold' }
});
