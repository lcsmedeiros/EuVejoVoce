import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, TextInput, Alert,
  ScrollView, Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { salvarLocalizacao } from '../database/db';

const MAX_LEITURAS = 5;

function mediasPonderadas(leituras) {
  const pesos = leituras.map(r => r.accuracy ? 1 / r.accuracy : 1);
  const totalPeso = pesos.reduce((s, p) => s + p, 0);
  return {
    latitude:  leituras.reduce((s, r, i) => s + r.latitude  * pesos[i], 0) / totalPeso,
    longitude: leituras.reduce((s, r, i) => s + r.longitude * pesos[i], 0) / totalPeso,
    altitude:  leituras[leituras.length - 1].altitude,
    accuracy:  leituras[leituras.length - 1].accuracy,
  };
}

export default function HomeScreen({ onVerMapa, onVerHistorico }) {
  const [coords, setCoords] = useState(null);
  const [endereco, setEndereco] = useState(null);
  const [label, setLabel] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [aguardando, setAguardando] = useState(true);
  const [numLeituras, setNumLeituras] = useState(0);
  const watchRef = useRef(null);
  const leiturasRef = useRef([]);
  const scrollRef = useRef(null);
  const [kbPadding, setKbPadding] = useState(0);

  useEffect(() => {
    iniciar();
    return () => { if (watchRef.current) watchRef.current.remove(); };
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => {
      setKbPadding(e.endCoordinates.height);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbPadding(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  async function iniciar() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setAguardando(false);
      Alert.alert('Permissão negada', 'Localização é necessária para usar o app.');
      return;
    }

    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
      async (loc) => {
        leiturasRef.current = [...leiturasRef.current.slice(-(MAX_LEITURAS - 1)), loc.coords];
        const media = mediasPonderadas(leiturasRef.current);
        setCoords(media);
        setNumLeituras(leiturasRef.current.length);
        setAguardando(false);
        try {
          const [end] = await Location.reverseGeocodeAsync(loc.coords);
          setEndereco(end);
        } catch {}
      }
    );
  }

  async function salvar() {
    if (!coords) return;
    setSalvando(true);
    try {
      const endStr = endereco
        ? [endereco.street, endereco.district, endereco.city].filter(Boolean).join(', ')
        : '';
      await salvarLocalizacao({
        label: label.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude,
        accuracy: coords.accuracy,
        endereco: endStr,
      });
      setLabel('');
      Alert.alert('Salvo!', 'Localização registrada com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  const estabilizando = numLeituras < MAX_LEITURAS;
  const boaSinal = coords?.accuracy != null && coords.accuracy <= 10;

  return (
    <ScrollView ref={scrollRef} style={s.container} contentContainerStyle={{ paddingBottom: 40 + kbPadding }} keyboardShouldPersistTaps="handled">
      <StatusBar style="light" />

      <View style={s.headerBox}>
        <Text style={s.titulo}>EU VEJO VOCÊ</Text>
        <Text style={s.subtitulo}>SISTEMA DE RASTREIO TÁTICO</Text>
        <View style={s.headerLine} />
      </View>

      {aguardando && (
        <View style={s.row}>
          <ActivityIndicator color="#00FF66" size="small" />
          <Text style={s.info}>  ADQUIRINDO SINAL GPS...</Text>
        </View>
      )}

      {coords && (
        <View style={s.card}>

          {/* Cabeçalho com status */}
          <View style={s.cardHeaderRow}>
            <Text style={s.cardHeader}>◎  POSIÇÃO DO OPERADOR</Text>
            <View style={s.statusBadge}>
              <View style={[s.statusDot, { backgroundColor: estabilizando ? '#ffd60a' : boaSinal ? '#00ff9f' : '#ff2d55' }]} />
              <Text style={[s.statusTexto, { color: estabilizando ? '#ffd60a' : boaSinal ? '#00ff9f' : '#ff2d55' }]}>
                {estabilizando ? 'CALIBRANDO' : boaSinal ? 'ONLINE' : 'STANDBY'}
              </Text>
            </View>
          </View>

          {/* Endereço */}
          <View style={s.enderecoRow}>
            <Text style={s.enderecoIcon}>▸</Text>
            {endereco
              ? <Text style={s.endereco}>{[endereco.street, endereco.district, endereco.city].filter(Boolean).join(', ')}</Text>
              : <Text style={s.enderecoCarregando}>DECODIFICANDO ENDEREÇO...</Text>
            }
          </View>

          {/* Seção: Coordenadas */}
          <View style={s.secRow}>
            <Text style={s.secLabel}>COORDENADAS</Text>
            <View style={s.secLine} />
          </View>

          <View style={s.coordRow}>
            <Text style={s.dataLabel}>LAT</Text>
            <Text style={s.valor}>{coords.latitude.toFixed(8)}</Text>
          </View>
          <View style={s.coordRow}>
            <Text style={s.dataLabel}>LNG</Text>
            <Text style={s.valor}>{coords.longitude.toFixed(8)}</Text>
          </View>

          {/* Seção: Telemetria */}
          <View style={[s.secRow, { marginTop: 12 }]}>
            <Text style={s.secLabel}>TELEMETRIA</Text>
            <View style={s.secLine} />
          </View>

          <View style={s.telRow}>
            {coords.altitude != null && (
              <View style={s.telItem}>
                <Text style={s.dataLabel}>ALT</Text>
                <Text style={s.valor}>{coords.altitude.toFixed(1)} m</Text>
              </View>
            )}
            <View style={s.telItem}>
              <Text style={s.dataLabel}>PREC</Text>
              <Text style={[s.valor, { color: boaSinal ? '#00ff9f' : '#ff2d55' }]}>
                ± {coords.accuracy.toFixed(1)} m
              </Text>
            </View>
          </View>

          {/* Status do sinal */}
          <View style={s.separador} />

          <View style={s.sinalRow}>
            {estabilizando ? (
              <>
                <View style={s.progressRow}>
                  {Array.from({ length: MAX_LEITURAS }).map((_, i) => (
                    <View key={i} style={[s.progressBlock, i < numLeituras && s.progressBlockFilled]} />
                  ))}
                </View>
                <Text style={s.calibrando}>ADQUIRINDO ALVO... {numLeituras}/{MAX_LEITURAS}</Text>
              </>
            ) : (
              <Text style={[s.sinalTexto, { color: boaSinal ? '#00ff9f' : '#ff2d55' }]}>
                {boaSinal ? '⊕ SATÉLITE CALIBRADO' : '▲ SINAL INSTÁVEL — AGUARDE'}
              </Text>
            )}
          </View>

        </View>
      )}

      <TextInput
        style={s.input}
        placeholder="CODINOME DO ALVO..."
        placeholderTextColor="#2E6B45"
        value={label}
        onChangeText={setLabel}
      />

      <TouchableOpacity
        style={[s.botao, (!coords || salvando || estabilizando) && { opacity: 0.35 }]}
        onPress={salvar}
        disabled={!coords || salvando || estabilizando}
      >
        {salvando
          ? <ActivityIndicator color="#0B0F0C" />
          : <Text style={s.botaoTexto}>
              {estabilizando ? 'ADQUIRINDO ALVO...' : 'MARCAR ALVO'}
            </Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.botaoSec, !coords && { opacity: 0.35 }]}
        onPress={() => onVerMapa(coords)}
        disabled={!coords}
      >
        <Text style={s.botaoSecTexto}>MARCAR ALVO MANUALMENTE</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.botaoSec} onPress={onVerHistorico}>
        <Text style={s.botaoSecTexto}>HISTÓRICO DE ALVOS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0B0F0C', padding: 24 },

  headerBox:    { marginTop: 48, marginBottom: 24 },
  titulo:       { fontSize: 22, fontWeight: '900', color: '#00FF66', letterSpacing: 4 },
  subtitulo:    { fontSize: 10, color: '#2E6B45', letterSpacing: 3, marginTop: 4, marginBottom: 10 },
  headerLine:   { height: 1, backgroundColor: 'rgba(0, 255, 102, 0.2)' },

  row:          { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  info:         { color: '#00FF66', fontSize: 12, fontFamily: 'monospace', letterSpacing: 1 },

  card: {
    backgroundColor: '#12181A',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#00FF66',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeaderRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHeader:         { fontSize: 10, color: '#00FF66', letterSpacing: 3, fontFamily: 'monospace', opacity: 0.7 },
  statusBadge:        { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot:          { width: 6, height: 6, borderRadius: 3 },
  statusTexto:        { fontSize: 9, fontFamily: 'monospace', letterSpacing: 1, fontWeight: '900' },

  enderecoRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 12 },
  enderecoIcon:       { color: '#00FF66', fontSize: 12, marginTop: 1, opacity: 0.6 },
  endereco:           { color: '#C2E8CE', fontSize: 13, fontWeight: '600', flex: 1 },
  enderecoCarregando: { color: '#2E6B45', fontSize: 11, fontFamily: 'monospace', letterSpacing: 1, flex: 1 },

  secRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  secLabel:     { color: '#2E6B45', fontSize: 9, letterSpacing: 2, fontFamily: 'monospace' },
  secLine:      { flex: 1, height: 1, backgroundColor: 'rgba(0, 255, 102, 0.08)' },

  separador:    { height: 1, backgroundColor: 'rgba(0, 255, 102, 0.08)', marginVertical: 12 },
  coordRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dataLabel:    { color: '#2E6B45', fontSize: 11, letterSpacing: 2, fontFamily: 'monospace' },
  valor:        { color: '#00FF66', fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },

  telRow:       { flexDirection: 'row', gap: 16 },
  telItem:      { flex: 1 },

  sinalRow:          { alignItems: 'center', marginTop: 4 },
  progressRow:       { flexDirection: 'row', gap: 6, marginBottom: 8 },
  progressBlock:     { width: 28, height: 5, backgroundColor: 'rgba(0, 255, 102, 0.1)', borderRadius: 2 },
  progressBlockFilled: { backgroundColor: '#00FF66' },
  calibrando:        { color: '#2E6B45', fontSize: 10, letterSpacing: 2, fontFamily: 'monospace' },
  sinalTexto:        { fontSize: 11, letterSpacing: 1, fontFamily: 'monospace', fontWeight: '700' },

  input: {
    backgroundColor: '#0E1411',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.25)',
    borderRadius: 4,
    padding: 14,
    fontSize: 13,
    color: '#C2E8CE',
    marginBottom: 12,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  botao:        { backgroundColor: '#00FF66', padding: 15, borderRadius: 4, alignItems: 'center', marginBottom: 10, shadowColor: '#00FF66', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 },
  botaoTexto:   { color: '#0B0F0C', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  botaoSec: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoSecTexto: { color: '#00FF66', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
});
