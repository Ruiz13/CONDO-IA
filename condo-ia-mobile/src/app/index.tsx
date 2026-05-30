import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Link } from 'expo-router';

const { width } = Dimensions.get('window');

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>BALANCE ACTUAL</Text>
        <Text style={styles.balanceAmount}>$125</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AL DÍA</Text>
        </View>
      </View>

      {/* Grid of Action Buttons */}
      <View style={styles.gridContainer}>
        {/* Chat IA */}
        <Link href="/chat" style={styles.gridItem}>
          <View style={{alignItems: 'center'}}>
            <LinearGradient colors={['#c084fc', '#ec4899']} style={styles.iconContainer}>
              <Ionicons name="chatbubble-ellipses" size={32} color="white" />
            </LinearGradient>
            <Text style={styles.gridText}>Chat IA</Text>
          </View>
        </Link>

        {/* Reportar Pago */}
        <Link href="/report-payment" style={styles.gridItem}>
          <View style={{alignItems: 'center'}}>
            <LinearGradient colors={['#fbbf24', '#f97316']} style={styles.iconContainer}>
              <Ionicons name="card" size={32} color="white" />
            </LinearGradient>
            <Text style={styles.gridText}>Reportar Pago</Text>
          </View>
        </Link>

        {/* Historial */}
        <TouchableOpacity style={styles.gridItem}>
          <LinearGradient colors={['#2dd4bf', '#0ea5e9']} style={styles.iconContainer}>
            <Ionicons name="receipt" size={32} color="white" />
          </LinearGradient>
          <Text style={styles.gridText}>Historial</Text>
        </TouchableOpacity>

        {/* Votos */}
        <TouchableOpacity style={styles.gridItem}>
          <LinearGradient colors={['#38bdf8', '#0284c7']} style={styles.iconContainer}>
            <MaterialCommunityIcons name="checkbox-marked-outline" size={36} color="white" />
          </LinearGradient>
          <Text style={styles.gridText}>Votos</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
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
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={26} color="#64748b" />
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
  
  // Balance Card
  balanceCard: {
    margin: 24,
    marginTop: 40,
    padding: 30,
    backgroundColor: '#0a0a16',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#1e1e38',
    alignItems: 'flex-start'
  },
  balanceLabel: { color: '#8a8a9d', fontSize: 13, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  balanceAmount: { color: '#ffffff', fontSize: 72, fontWeight: '900', marginBottom: 20, letterSpacing: -2 },
  badge: { backgroundColor: 'rgba(52, 211, 153, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: '#10b981', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 30,
    paddingHorizontal: 10,
    marginBottom: 40
  },
  gridItem: {
    width: (width / 2) - 40,
    alignItems: 'center',
    marginBottom: 10
  },
  iconContainer: {
    width: 95,
    height: 95,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
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
    backgroundColor: '#050512',
    borderTopWidth: 1,
    borderTopColor: '#1e1e38',
    paddingBottom: 30 
  },
  navItem: { alignItems: 'center', width: 60 },
  navText: { color: '#64748b', fontSize: 11, marginTop: 6, fontWeight: '600' }
});
