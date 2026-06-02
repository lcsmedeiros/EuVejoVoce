import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, TextInput, Alert, ScrollView, Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { salvarLocalizacao } from '../database/db';

const MAX_LEITURAS = 5;

function mediasPonderadas(leituras) {
  // Leituras com menor accuracy (mais precisas) recebem mais peso
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

  useEffect(() => {
    iniciar();
    return () => { if (watchRef.current) watchRef.current.remove(); };
  }, []);

  async function iniciar() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setAguardando(false);
      Alert.alert('Permissão negada', 'Localização é necessária para usar o app.');
      return;
    }

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      async (loc) => {
        // Acumula leituras e calcula média ponderada
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

  async function compartilhar() {
    if (!coords) return;
    const url = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
    const endStr = endereco
      ? [endereco.street, endereco.district, endereco.city].filter(Boolean).join(', ') + '\n'
      : '';
    await Share.share({ message: `${endStr}${url}` });
  }

  const estabilizando = numLeituras < MAX_LEITURAS;
  const boaSinal = coords?.accuracy != null && coords.accuracy <= 10;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar style="light" />
      <Text style={s.titulo}>Eu Vejo Você</Text>

      {aguardando && (
        <View style={s.row}>
          <ActivityIndicator color="#e94560" />
          <Text style={s.info}>  Aguardando GPS...</Text>
        </View>
      )}

      {coords && (
        <View style={s.card}>
          {endereco ? (
            <Text style={s.endereco}>
              {[endereco.street, endereco.district, endereco.city].filter(Boolean).join(', ')}
            </Text>
          ) : (
            <Text style={s.enderecoCarregando}>Carregando endereço...</Text>
          )}

          <View style={s.coordRow}>
            <Text style={s.label}>Latitude</Text>
            <Text style={s.valor}>{coords.latitude.toFixed(8)}</Text>
          </View>
          <View style={s.coordRow}>
            <Text style={s.label}>Longitude</Text>
            <Text style={s.valor}>{coords.longitude.toFixed(8)}</Text>
          </View>
          {coords.altitude != null && (
            <View style={s.coordRow}>
              <Text style={s.label}>Altitude</Text>
              <Text style={s.valor}>{coords.altitude.toFixed(1)} m</Text>
            </View>
          )}
          <View style={s.coordRow}>
            <Text style={s.label}>Precisão</Text>
            <Text style={[s.valor, { color: boaSinal ? '#4caf50' : '#e94560' }]}>
              ± {coords.accuracy.toFixed(1)} m
            </Text>
          </View>

          <View style={s.sinalRow}>
            {estabilizando ? (
              <>
                <ActivityIndicator size="small" color="#a2a8d3" />
                <Text style={s.sinalTexto}>  Estabilizando... ({numLeituras}/{MAX_LEITURAS})</Text>
              </>
            ) : (
              <Text style={[s.sinalTexto, { color: boaSinal ? '#4caf50' : '#e94560' }]}>
                {boaSinal ? 'Sinal estável e preciso' : 'Sinal fraco — aguarde melhorar'}
              </Text>
            )}
          </View>
        </View>
      )}

      <TextInput
        style={s.input}
        placeholder="Rótulo (ex: Casa, Trabalho...)"
        placeholderTextColor="#6b7aa1"
        value={label}
        onChangeText={setLabel}
      />

      <TouchableOpacity
        style={[s.botao, (!coords || salvando || estabilizando) && { opacity: 0.5 }]}
        onPress={salvar}
        disabled={!coords || salvando || estabilizando}
      >
        {salvando
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.botaoTexto}>
              {estabilizando ? 'Aguarde estabilizar...' : 'Salvar Localização'}
            </Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.botao, s.botaoSec, !coords && { opacity: 0.5 }]}
        onPress={compartilhar}
        disabled={!coords}
      >
        <Text style={[s.botaoTexto, { color: '#e94560' }]}>Compartilhar Localização</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.botao, s.botaoSec, !coords && { opacity: 0.5 }]}
        onPress={() => onVerMapa(coords)}
        disabled={!coords}
      >
        <Text style={[s.botaoTexto, { color: '#e94560' }]}>Ver no Mapa</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.botao, s.botaoSec]} onPress={onVerHistorico}>
        <Text style={[s.botaoTexto, { color: '#e94560' }]}>Ver Histórico</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#1a1a2e', padding: 24 },
  titulo:             { fontSize: 28, fontWeight: 'bold', color: '#e94560', marginTop: 48, marginBottom: 24 },
  row:                { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  info:               { color: '#a2a8d3', fontSize: 15 },
  card:               { backgroundColor: '#16213e', borderRadius: 16, padding: 20, marginBottom: 20 },
  endereco:           { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  enderecoCarregando: { color: '#6b7aa1', fontSize: 13, marginBottom: 12 },
  coordRow:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label:              { color: '#a2a8d3', fontSize: 14 },
  valor:              { color: '#eee', fontSize: 14, fontWeight: '600', fontFamily: 'monospace' },
  sinalRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  sinalTexto:         { color: '#a2a8d3', fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: '#0f3460', borderRadius: 12, padding: 16,
    fontSize: 16, color: '#eee', marginBottom: 12,
  },
  botao:      { backgroundColor: '#e94560', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  botaoSec:   { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#e94560' },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
