import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet,
  ScrollView, Keyboard,
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
  const scrollRef = useRef(null);
  const [kbPadding, setKbPadding] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => {
      setKbPadding(e.endCoordinates.height);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbPadding(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

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
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
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
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={{ paddingBottom: 40 + kbPadding }} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← VOLTAR</Text>
        </TouchableOpacity>
        <Text style={styles.title}>GPS DE PRECISÃO</Text>
        <View style={styles.headerLine} />
      </View>

      {status === 'requesting' && (
        <View style={styles.statusRow}>
          <ActivityIndicator color="#00e5ff" size="small" />
          <Text style={styles.statusText}>  SOLICITANDO PERMISSÃO...</Text>
        </View>
      )}
      {status === 'watching' && !coords && (
        <View style={styles.statusRow}>
          <ActivityIndicator color="#00e5ff" size="small" />
          <Text style={styles.statusText}>  AGUARDANDO SINAL GPS...</Text>
        </View>
      )}
      {status === 'error' && (
        <Text style={styles.errorText}>▲ PERMISSÃO DE LOCALIZAÇÃO NEGADA</Text>
      )}

      {coords && (
        <View style={styles.coordCard}>
          <Text style={styles.cardHeader}>◈  DADOS DE POSIÇÃO</Text>
          <CoordRow label="LAT"  value={coords.latitude.toFixed(8)} />
          <CoordRow label="LNG" value={coords.longitude.toFixed(8)} />
          <CoordRow
            label="ALT"
            value={coords.altitude != null ? `${coords.altitude.toFixed(1)} m` : 'N/D'}
          />
          <View style={styles.separador} />
          <CoordRow
            label="PREC"
            value={coords.accuracy != null ? `± ${coords.accuracy.toFixed(1)} m` : 'N/D'}
            highlight={boaSinal ? 'green' : 'red'}
          />
          <Text style={[styles.signalLabel, { color: boaSinal ? '#00ff9f' : '#ff2d55' }]}>
            {boaSinal ? '● SINAL EXCELENTE — PODE SALVAR' : '▲ AGUARDANDO MELHOR SINAL...'}
          </Text>
        </View>
      )}

      <View style={styles.saveBox}>
        <TextInput
          style={styles.input}
          placeholder="RÓTULO: EX. MESA, PORTA, JANELA..."
          placeholderTextColor="#2a4060"
          value={label}
          onChangeText={setLabel}
        />
        <TouchableOpacity
          style={[globalStyles.button, (!coords || salvando) && { opacity: 0.35 }]}
          onPress={handleSalvar}
          disabled={!coords || salvando}
        >
          {salvando
            ? <ActivityIndicator color="#07090f" />
            : <Text style={globalStyles.buttonText}>SALVAR LOCALIZAÇÃO</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonSecondary]}
          onPress={onNavigateHistorico}
        >
          <Text style={[globalStyles.buttonText, globalStyles.buttonTextSecondary]}>
            HISTÓRICO DE ALVOS
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
        highlight === 'green' && { color: '#00ff9f' },
        highlight === 'red'   && { color: '#ff2d55' },
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#07090f', paddingHorizontal: 20 },
  header:      { paddingTop: 48, marginBottom: 24 },
  backBtn:     { color: '#2a4060', fontSize: 12, marginBottom: 12, fontFamily: 'monospace', letterSpacing: 2 },
  title:       { fontSize: 18, fontWeight: '900', color: '#00e5ff', letterSpacing: 3, marginBottom: 10 },
  headerLine:  { height: 1, backgroundColor: 'rgba(0, 229, 255, 0.2)' },
  statusRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statusText:  { color: '#00e5ff', fontSize: 12, fontFamily: 'monospace', letterSpacing: 1 },
  errorText:   { color: '#ff2d55', fontSize: 12, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 16 },
  coordCard: {
    backgroundColor: '#0b1019',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#00e5ff',
    padding: 20,
    marginBottom: 24,
  },
  cardHeader:  { fontSize: 10, color: '#00e5ff', letterSpacing: 3, marginBottom: 12, fontFamily: 'monospace', opacity: 0.7 },
  coordRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  coordLabel:  { color: '#2a4060', fontSize: 11, letterSpacing: 2, fontFamily: 'monospace' },
  coordValue:  { color: '#00e5ff', fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },
  separador:   { height: 1, backgroundColor: 'rgba(0, 229, 255, 0.08)', marginVertical: 8 },
  signalLabel: { textAlign: 'center', fontWeight: '700', marginTop: 10, fontSize: 11, fontFamily: 'monospace', letterSpacing: 1 },
  saveBox:     { gap: 10 },
  input: {
    backgroundColor: '#0a0f1a',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 4,
    padding: 14,
    fontSize: 13,
    color: '#c5dce8',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
