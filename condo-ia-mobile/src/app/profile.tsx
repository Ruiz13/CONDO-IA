import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../constants/api';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Solicitar permisos
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Se necesita permiso para acceder a la galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Importante para enviar al backend
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      uploadAvatar(base64Image);
    }
  };

  const uploadAvatar = async (base64Image: string) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL('/api/auth/update-avatar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          avatarBase64: base64Image
        })
      });

      if (response.ok) {
        updateUser({ avatarBase64: base64Image });
        Alert.alert("Éxito", "Foto de perfil actualizada.");
      } else {
        Alert.alert("Error", "No se pudo actualizar la foto.");
      }
    } catch (error) {
      Alert.alert("Error", "Problema de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Cuenta</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={loading}>
          {user?.avatarBase64 ? (
            <Image source={{ uri: user.avatarBase64 }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color="#64748b" />
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="small" color="#c084fc" style={{ marginTop: 10 }} />}

        <View style={styles.infoCard}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <Text style={styles.value}>{user?.email}</Text>
          
          <Text style={[styles.label, { marginTop: 15 }]}>Rol</Text>
          <Text style={styles.value}>{user?.role === 'OWNER' ? 'Propietario' : 'Administrador'}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050512' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e1e38' },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 30 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#c084fc', resizeMode: 'cover' },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#1e1e38', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#1e1e38' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#c084fc', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#050512' },
  infoCard: { width: '100%', backgroundColor: '#0a0a16', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#1e1e38', marginBottom: 30 },
  label: { color: '#8a8a9d', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  value: { color: '#ffffff', fontSize: 16, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});
