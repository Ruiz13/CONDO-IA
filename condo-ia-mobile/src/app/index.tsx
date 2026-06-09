import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Link, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const [totalDebt, setTotalDebt] = useState<number | null>(null);

  const forceFetch = React.useCallback(async () => {
    if (!user) return;
    
    try {
      const res = await fetch(API_URL(`/api/invoices/pending/${user.id}?cb=${Math.random()}`), {
        headers: { "Bypass-Tunnel-Reminder": "true" },
      });
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const debt = data.reduce((acc: number, inv: any) => acc + (inv.totalAmount - (inv.amountPaid || 0)), 0);
        setTotalDebt(debt);
      } else if (Array.isArray(data) && data.length === 0) {
        setTotalDebt(0);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
    }
  }, [user]);

  React.useEffect(() => {
    forceFetch();
  }, [forceFetch]);

  useFocusEffect(
    React.useCallback(() => {
      forceFetch();
    }, [forceFetch])
  );
  
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header Logo */}
      <View style={styles.homeHeader}>
        <Image 
          source={require("../../assets/images/logo.png")} 
          style={{ width: 180, height: 60 }} 
          resizeMode="contain" 
        />
        <Text style={styles.tenantNameText}>{user?.tenantName || 'Mi Condominio'}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* Balance Card - Now Clickable */}
      <TouchableOpacity activeOpacity={0.8} onPress={forceFetch}>
        <LinearGradient 
          colors={['#1e3a8a', '#312e81']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }} 
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>SALDO DEUDOR (Toca para actualizar)</Text>
          <Text style={styles.balanceAmount}>
            {totalDebt === null ? "..." : `$${Math.max(0, totalDebt).toFixed(2)}`}
          </Text>
          {totalDebt === null ? (
            <View style={[styles.badge, { backgroundColor: 'transparent' }]} />
          ) : totalDebt <= 0.01 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AL DÍA 🎉</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Text style={[styles.badgeText, { color: '#ef4444' }]}>PENDIENTE</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Grid of Action Buttons */}
      <View style={styles.gridContainer}>
        {/* Chat IA */}
        <View style={styles.gridItem}>
          <Link href="/chat" asChild>
            <TouchableOpacity style={{alignItems: 'center', width: '100%'}}>
              <LinearGradient colors={['#c084fc', '#ec4899']} style={styles.iconContainer}>
                <Ionicons name="chatbubble-ellipses" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.gridText}>Chat IA</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Reportar Pago */}
        <View style={styles.gridItem}>
          <Link href="/report-payment" asChild>
            <TouchableOpacity style={{alignItems: 'center', width: '100%'}}>
              <LinearGradient colors={['#fbbf24', '#f97316']} style={styles.iconContainer}>
                <Ionicons name="card" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.gridText}>Reportar Pago</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Historial */}
        <View style={styles.gridItem}>
          <Link href="/history" asChild>
            <TouchableOpacity style={{alignItems: 'center', width: '100%'}}>
              <LinearGradient colors={['#2dd4bf', '#0ea5e9']} style={styles.iconContainer}>
                <Ionicons name="receipt" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.gridText}>Historial Pagos</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Facturas */}
        <View style={styles.gridItem}>
          <Link href="/invoices" asChild>
            <TouchableOpacity style={{alignItems: 'center', width: '100%'}}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.iconContainer}>
                <Ionicons name="document-text" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.gridText}>Mis Facturas</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Reservas */}
        <View style={styles.gridItem}>
          <Link href="/reservations" asChild>
            <TouchableOpacity style={{alignItems: 'center', width: '100%'}}>
              <LinearGradient colors={['#a855f7', '#7e22ce']} style={styles.iconContainer}>
                <Ionicons name="calendar" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.gridText}>Reservas</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Votos */}
        <View style={styles.gridItem}>
          <Link href="/voting" asChild>
            <TouchableOpacity style={{alignItems: 'center', width: '100%'}}>
              <LinearGradient colors={['#38bdf8', '#0284c7']} style={styles.iconContainer}>
                <MaterialCommunityIcons name="checkbox-marked-outline" size={36} color="white" />
              </LinearGradient>
              <Text style={styles.gridText}>Votos</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Comunicados */}
        <View style={styles.gridItem}>
          <Link href="/announcements" asChild>
            <TouchableOpacity style={{alignItems: 'center', width: '100%'}}>
              <LinearGradient colors={['#f43f5e', '#be123c']} style={styles.iconContainer}>
                <Ionicons name="megaphone" size={36} color="white" />
              </LinearGradient>
              <Text style={styles.gridText}>Comunicados</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="home" size={26} color="#3b82f6" />
          <Text style={[styles.navText, { color: '#3b82f6' }]}>Hogar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/announcements')}>
          <Ionicons name="chatbubble" size={26} color="#64748b" />
          <Text style={styles.navText}>Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/voting')}>
          <MaterialCommunityIcons name="checkbox-marked" size={28} color="#64748b" />
          <Text style={styles.navText}>Votar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          {user?.avatarBase64 ? (
            <Image 
              source={{ uri: user.avatarBase64 }} 
              style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#64748b' }} 
              resizeMode="cover" 
            />
          ) : (
            <Ionicons name="person" size={26} color="#64748b" />
          )}
          <Text style={styles.navText}>Cuenta</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#050512', // Muy oscuro
    justifyContent: 'space-between'
  },
  
  homeHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 0,
  },
  tenantNameText: {
    color: '#8a8a9d',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },

  // Balance Card
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'flex-start',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceLabel: { color: '#8a8a9d', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  balanceAmount: { color: '#ffffff', fontSize: 46, fontWeight: '900', marginBottom: 6, letterSpacing: -1 },
  badge: { backgroundColor: 'rgba(52, 211, 153, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: '#10b981', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  gridItem: {
    width: '46%', // 46% so there's an 8% gap in between
    alignItems: 'center',
    marginBottom: 20
  },
  iconContainer: {
    width: 65,
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  gridText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 16,
    backgroundColor: '#0a0a16', // Ligeramente más claro
    borderTopWidth: 1,
    borderTopColor: '#1e1e38',
    paddingBottom: 40 // Más espacio inferior
  },
  navItem: { alignItems: 'center', width: 70 },
  navText: { color: '#94a3b8', fontSize: 13, marginTop: 6, fontWeight: '700' }
});
