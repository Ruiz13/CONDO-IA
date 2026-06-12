import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Image, ActivityIndicator, Alert, ScrollView, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../constants/api';

// Mapeo de roles del backend a etiquetas legibles
const ROLE_LABELS: Record<string, string> = {
  RESIDENT: 'Propietario',
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  SUPER_ADMIN: 'Super Administrador',
};

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL('/api/auth/update-profile'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id, newName: nameInput }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        updateUser({ name: nameInput });
        setIsEditingName(false);
        Alert.alert('✅ Éxito', 'Nombre de propietario actualizado.');
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar el nombre.');
      }
    } catch {
      Alert.alert('Error', 'Problema de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? 'Propietario';

  // Iniciales del correo para el avatar placeholder
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??';

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para cambiar la foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id, avatarBase64: base64Image }),
      });

      if (response.ok) {
        updateUser({ avatarBase64: base64Image });
        Alert.alert('✅ Éxito', 'Tu foto de perfil fue actualizada correctamente.');
      } else {
        Alert.alert('Error', 'No se pudo actualizar la foto. Intenta de nuevo.');
      }
    } catch {
      Alert.alert('Error', 'Problema de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir', style: 'destructive',
          onPress: () => { logout(); router.replace('/login'); }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Cuenta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Avatar con botón de cambio */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickImage}
            disabled={loading}
            activeOpacity={0.8}
          >
            {user?.avatarBase64 ? (
              <Image source={{ uri: user.avatarBase64 }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={['#7c3aed', '#c084fc']}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.initialsText}>{initials}</Text>
              </LinearGradient>
            )}
            {/* Badge cámara */}
            <View style={styles.editBadge}>
              {loading
                ? <ActivityIndicator size="small" color="white" />
                : <Ionicons name="camera" size={16} color="white" />
              }
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage} disabled={loading} style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>
              {loading ? 'Subiendo...' : 'Cambiar foto de perfil'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta de información */}
        <View style={styles.infoCard}>
          {/* Rol */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="shield-checkmark" size={20} color="#c084fc" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Rol</Text>
              <Text style={styles.infoValue}>{roleLabel}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Nombre */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="person" size={20} color="#a855f7" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Nombre Completo</Text>
              {!isEditingName ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                  <Text style={styles.infoValue}>{user?.name || 'Completar nombre...'}</Text>
                  <TouchableOpacity onPress={() => { setNameInput(user?.name || ''); setIsEditingName(true); }}>
                    <Ionicons name="create-outline" size={18} color="#c084fc" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 10 }}>
                  <TextInput
                    value={nameInput}
                    onChangeText={setNameInput}
                    placeholder="Tu nombre..."
                    placeholderTextColor="#64748b"
                    style={{
                      flex: 1,
                      color: '#ffffff',
                      fontSize: 15,
                      borderBottomWidth: 1,
                      borderBottomColor: '#c084fc',
                      paddingVertical: 2
                    }}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleSaveName} disabled={loading} style={{ padding: 4 }}>
                    <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditingName(false)} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Correo */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="mail" size={20} color="#3b82f6" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Correo Electrónico</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Condominio */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="business" size={20} color="#10b981" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Condominio</Text>
              <Text style={styles.infoValue}>{user?.tenantName || 'Mi Edificio'}</Text>
            </View>
          </View>
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050512' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e1e38',
  },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  content: { padding: 24, alignItems: 'center', paddingBottom: 40 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: '#c084fc',
  },
  avatarPlaceholder: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
  },
  initialsText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  editBadge: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: '#c084fc',
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#050512',
  },
  changePhotoBtn: { paddingVertical: 6, paddingHorizontal: 16 },
  changePhotoText: { color: '#c084fc', fontSize: 14, fontWeight: '600' },

  // Info card
  infoCard: {
    width: '100%', backgroundColor: '#0a0a1a',
    borderRadius: 20, borderWidth: 1, borderColor: '#1e1e38',
    marginBottom: 28, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 18, paddingHorizontal: 20,
  },
  infoIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#1e1e38',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  infoText: { flex: 1 },
  infoLabel: { color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  infoValue: { color: '#ffffff', fontSize: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#1e1e38', marginHorizontal: 20 },

  // Logout
  logoutButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: 25, borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    width: '100%', justifyContent: 'center',
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
});
