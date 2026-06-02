import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, StyleSheet,
} from 'react-native';
import * as Location from 'expo-location';
import { salvarLocalizacao } from '../database/db';
import { globalStyles } from '../styles/globalStyles';

export default function GpsScreen({ onBack, onNavigateHistorico }) {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [label, setLabel] = useState('');
  const [salvando, setSalvando] = useState(false);
  const watchRef = useRef(null);

  useEffect(() => {
    iniciarRastreamento();
    return () => {
      if (watchRef.current) watchRef.current.remove();
    };
  }, []);

  async function iniciarRastreamento() {
    setStatus('requesting');
    const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
    if (permStatus !== 'granted') {
      setStatus('error');
      Alert.alert('Permissão negada', 'Permissão de localização é necessária para usar esta função.');
      return;
    }
    setStatus('watching');
    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (location) => setCoords(location.coords)
    );
  }

  async function handleSalvar() {
    if (!coords) return;
    setSalvando(true);
    try {
      await salvarLocalizacao({
        label: label.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude,
        accuracy: coords.accuracy,
      });
      setLabel('');
      Alert.alert('Salvo!', 'Localização registrada com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a localização.');
    } finally {
      setSalvando(false);
    }
  }

  const boaSinal = coords && coords.accuracy != null && coords.accuracy <= 5;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>GPS de Precisão</Text>
      </View>

      {status === 'requesting' && (
        <View style={styles.statusRow}>
          <ActivityIndicator color="#e94560" />
          <Text style={styles.statusText}>Solicitando permissão...</Text>
        </View>
      )}
      {status === 'watching' && !coords && (
        <View style={styles.statusRow}>
          <ActivityIndicator color="#e94560" />
          <Text style={styles.statusText}>Aguardando sinal GPS...</Text>
        </View>
      )}
      {status === 'error' && (
        <Text style={styles.errorText}>Permissão de localização negada.</Text>
      )}

      {coords && (
        <View style={styles.coordCard}>
          <CoordRow label="Latitude"  value={coords.latitude.toFixed(8)} />
          <CoordRow label="Longitude" value={coords.longitude.toFixed(8)} />
          <CoordRow
            label="Altitude"
            value={coords.altitude != null ? `${coords.altitude.toFixed(1)} m` : 'N/D'}
          />
          <CoordRow
            label="Precisão"
            value={coords.accuracy != null ? `± ${coords.accuracy.toFixed(1)} m` : 'N/D'}
            highlight={boaSinal ? 'green' : 'red'}
          />
          <Text style={[styles.signalLabel, { color: boaSinal ? '#4caf50' : '#e94560' }]}>
            {boaSinal ? 'Sinal excelente — pode salvar' : 'Aguardando melhor sinal...'}
          </Text>
        </View>
      )}

      <View style={styles.saveBox}>
        <TextInput
          style={styles.input}
          placeholder="Rótulo opcional (ex: Mesa, Porta, Janela...)"
          placeholderTextColor="#6b7aa1"
          value={label}
          onChangeText={setLabel}
        />
        <TouchableOpacity
          style={[globalStyles.button, (!coords || salvando) && { opacity: 0.5 }]}
          onPress={handleSalvar}
          disabled={!coords || salvando}
        >
          {salvando
            ? <ActivityIndicator color="#fff" />
            : <Text style={globalStyles.buttonText}>Salvar Localização</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonSecondary]}
          onPress={onNavigateHistorico}
        >
          <Text style={[globalStyles.buttonText, globalStyles.buttonTextSecondary]}>
            Ver Histórico
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function CoordRow({ label, value, highlight }) {
  return (
    <View style={styles.coordRow}>
      <Text style={styles.coordLabel}>{label}</Text>
      <Text style={[
        styles.coordValue,
        highlight === 'green' && { color: '#4caf50' },
        highlight === 'red'   && { color: '#e94560' },
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1a1a2e', paddingHorizontal: 20 },
  header:      { paddingTop: 48, marginBottom: 24 },
  backBtn:     { color: '#a2a8d3', fontSize: 16, marginBottom: 8 },
  title:       { fontSize: 26, fontWeight: 'bold', color: '#e94560' },
  statusRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  statusText:  { color: '#a2a8d3', fontSize: 15 },
  errorText:   { color: '#e94560', fontSize: 15, marginBottom: 16 },
  coordCard: {
    backgroundColor: '#16213e', borderRadius: 16, padding: 20,
    marginBottom: 24, elevation: 4,
  },
  coordRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  coordLabel:  { color: '#a2a8d3', fontSize: 14 },
  coordValue:  { color: '#eee', fontSize: 14, fontWeight: '600', fontFamily: 'monospace' },
  signalLabel: { textAlign: 'center', fontWeight: '600', marginTop: 8, fontSize: 13 },
  saveBox:     { gap: 12 },
  input: {
    backgroundColor: '#0f3460', borderRadius: 12, padding: 16,
    fontSize: 16, color: '#eee', marginBottom: 4,
  },
});
