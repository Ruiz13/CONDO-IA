import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ReportarPagoScreen() {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para usar la cámara');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !reference) {
      Alert.alert('Error', 'Por favor ingresa todos los campos');
      return;
    }

    setLoading(true);
    try {
      // Endpoint simulado. Luego ajustaremos a la ruta real de tu backend.
      const response = await fetch('https://condoia-api-2026.loca.lt/api/invoices/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ amount: parseFloat(amount), reference }),
      });
      
      if (response.ok) {
        Alert.alert('Éxito', 'Pago reportado correctamente');
        router.back();
      } else {
        Alert.alert('Error', 'No se pudo reportar el pago');
      }
    } catch (e) {
      Alert.alert('Error', 'Falla de conexión con el servidor');
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

      <View style={styles.formContainer}>
        <Text style={styles.label}>Monto del Pago ($)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 125.00" 
          placeholderTextColor="#8a8a9d"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Número de Referencia</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 123456789" 
          placeholderTextColor="#8a8a9d"
          value={reference}
          onChangeText={setReference}
        />

        <Text style={styles.label}>Comprobante (Opcional)</Text>
        <View style={styles.imageButtonsContainer}>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.imageButtonText}>Tomar Foto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.imageButtonText}>Subir Captura</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
              <Ionicons name="close-circle" size={28} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Enviar Reporte</Text>}
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
  formContainer: { padding: 30 },
  label: { color: '#8a8a9d', fontSize: 14, marginBottom: 10, fontWeight: '600' },
  input: { backgroundColor: '#1e1e38', color: '#fff', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 15, fontSize: 16, marginBottom: 25 },
  imageButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  imageButton: { flex: 1, backgroundColor: '#2d2d4a', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 5, flexDirection: 'row', justifyContent: 'center' },
  imageButtonText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  previewContainer: { alignItems: 'center', marginBottom: 20, position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 15, resizeMode: 'cover' },
  removeImageButton: { position: 'absolute', top: -10, right: -10, backgroundColor: '#050512', borderRadius: 15 },
  submitButton: { backgroundColor: '#f97316', paddingVertical: 16, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
