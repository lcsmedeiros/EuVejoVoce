import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Alert, StyleSheet, RefreshControl, Share,
} from 'react-native';
import { buscarLocalizacoes, deletarLocalizacao } from '../database/db';

export default function HistoricoScreen({ onBack, onVerNoMapa }) {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    try { setRegistros(await buscarLocalizacoes()); }
    finally { setCarregando(false); }
  }

  async function compartilhar(item) {
    const url = `https://maps.google.com/?q=${item.latitude},${item.longitude}`;
    const nome = item.label || item.endereco || '';
    await Share.share({ message: nome ? `${nome}\n${url}` : url });
  }

  async function confirmarDeletar(id) {
    Alert.alert('Remover', 'Deseja remover este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => { await deletarLocalizacao(id); carregar(); } },
    ]);
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.titulo}>Histórico</Text>
        <Text style={s.contagem}>{registros.length} registro(s)</Text>
      </View>

      <FlatList
        data={registros}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor="#e94560" />}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={<Text style={s.vazio}>Nenhuma localização salva ainda.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardTopo}>
              <Text style={s.rotulo}>{item.label || '(sem rótulo)'}</Text>
              <TouchableOpacity onPress={() => confirmarDeletar(item.id)}>
                <Text style={s.deletar}>✕</Text>
              </TouchableOpacity>
            </View>

            {!!item.endereco && <Text style={s.endereco}>{item.endereco}</Text>}

            <Text style={s.coords}>
              {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>

            {item.accuracy != null && (
              <Text style={s.meta}>Precisão: ± {item.accuracy.toFixed(1)} m</Text>
            )}

            <Text style={s.data}>{new Date(item.timestamp).toLocaleString('pt-BR')}</Text>

            <View style={s.acoes}>
              <TouchableOpacity
                style={[s.botaoAcao, { flex: 1, marginRight: 8 }]}
                onPress={() => onVerNoMapa({ latitude: item.latitude, longitude: item.longitude })}
              >
                <Text style={s.botaoAcaoTexto}>Ver no Mapa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.botaoAcao, { flex: 1 }]}
                onPress={() => compartilhar(item)}
              >
                <Text style={s.botaoAcaoTexto}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#1a1a2e', paddingHorizontal: 20 },
  header:       { paddingTop: 48, marginBottom: 20 },
  voltar:       { color: '#a2a8d3', fontSize: 16, marginBottom: 8 },
  titulo:       { fontSize: 24, fontWeight: 'bold', color: '#e94560' },
  contagem:     { color: '#a2a8d3', fontSize: 13, marginTop: 4 },
  vazio:        { color: '#6b7aa1', textAlign: 'center', marginTop: 48, fontSize: 16 },
  card: {
    backgroundColor: '#16213e', borderRadius: 16,
    padding: 16, marginBottom: 12, elevation: 4,
  },
  cardTopo:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rotulo:       { color: '#fff', fontWeight: '700', fontSize: 16, flex: 1 },
  deletar:      { color: '#e94560', fontSize: 18, paddingLeft: 8 },
  endereco:     { color: '#a2a8d3', fontSize: 13, marginBottom: 4 },
  coords:       { color: '#eee', fontFamily: 'monospace', fontSize: 13, marginBottom: 4 },
  meta:         { color: '#a2a8d3', fontSize: 12 },
  data:         { color: '#6b7aa1', fontSize: 12, marginTop: 4, marginBottom: 10 },
  acoes:       { flexDirection: 'row' },
  botaoAcao: {
    borderWidth: 1, borderColor: '#e94560', borderRadius: 8,
    padding: 8, alignItems: 'center',
  },
  botaoAcaoTexto: { color: '#e94560', fontSize: 13, fontWeight: '600' },
});
