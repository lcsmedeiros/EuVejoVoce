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

  function eliminar(item) {
    onVerNoMapa(
      { latitude: item.latitude, longitude: item.longitude },
      { latitude: item.latitude, longitude: item.longitude, label: item.label || '' }
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.voltar}>← VOLTAR</Text>
        </TouchableOpacity>
        <Text style={s.titulo}>ALVOS MARCADOS</Text>
        <Text style={s.contagem}>{registros.length} ALVO(S) CONFIRMADO(S)</Text>
        <View style={s.headerLine} />
      </View>

      <FlatList
        data={registros}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor="#00FF66" />}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <Text style={s.vazio}>[ NENHUM ALVO MARCADO ]</Text>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardTopo}>
              <Text style={s.rotulo}>{item.label || '(SEM IDENTIFICAÇÃO)'}</Text>
              <TouchableOpacity onPress={() => confirmarDeletar(item.id)}>
                <Text style={s.deletar}>✕</Text>
              </TouchableOpacity>
            </View>

            {!!item.endereco && <Text style={s.endereco}>{item.endereco}</Text>}

            <View style={s.separador} />

            <Text style={s.coords}>
              {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>

            <View style={s.metaRow}>
              {item.accuracy != null && (
                <Text style={s.meta}>PREC ± {item.accuracy.toFixed(1)} m</Text>
              )}
              <Text style={s.data}>{new Date(item.timestamp).toLocaleString('pt-BR')}</Text>
            </View>

            <View style={s.acoes}>
              <TouchableOpacity
                style={[s.botaoAcao, { flex: 1, marginRight: 8 }, { borderColor: 'rgba(255,45,85,0.4)' }]}
                onPress={() => eliminar(item)}
              >
                <Text style={[s.botaoAcaoTexto, { color: '#ff2d55' }]}>ELIMINAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.botaoAcao, { flex: 1 }]}
                onPress={() => compartilhar(item)}
              >
                <Text style={s.botaoAcaoTexto}>COMPARTILHAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0B0F0C', paddingHorizontal: 20 },
  header:     { paddingTop: 48, marginBottom: 20 },
  voltar:     { color: '#2E6B45', fontSize: 12, marginBottom: 12, fontFamily: 'monospace', letterSpacing: 2 },
  titulo:     { fontSize: 18, fontWeight: '900', color: '#00FF66', letterSpacing: 3, marginBottom: 4 },
  contagem:   { color: '#2E6B45', fontSize: 10, letterSpacing: 2, fontFamily: 'monospace', marginBottom: 10 },
  headerLine: { height: 1, backgroundColor: 'rgba(0, 255, 102, 0.2)' },
  vazio:      { color: '#2E6B45', textAlign: 'center', marginTop: 48, fontSize: 12, fontFamily: 'monospace', letterSpacing: 1 },

  card: {
    backgroundColor: '#12181A',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#00FF66',
    padding: 16,
    marginBottom: 10,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTopo:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  rotulo:     { color: '#C2E8CE', fontWeight: '700', fontSize: 14, flex: 1, letterSpacing: 1 },
  deletar:    { color: '#ff2d55', fontSize: 16, paddingLeft: 12 },
  endereco:   { color: '#356B49', fontSize: 12, marginBottom: 8 },
  separador:  { height: 1, backgroundColor: 'rgba(0, 255, 102, 0.06)', marginVertical: 8 },
  coords:     { color: '#00FF66', fontFamily: 'monospace', fontSize: 12, marginBottom: 6 },
  metaRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  meta:       { color: '#2E6B45', fontSize: 11, fontFamily: 'monospace', letterSpacing: 1 },
  data:       { color: '#2E6B45', fontSize: 11, fontFamily: 'monospace' },

  acoes:      { flexDirection: 'row' },
  botaoAcao: {
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
  },
  botaoAcaoAtivo:  { borderColor: 'rgba(255, 45, 85, 0.4)' },
  botaoAcaoTexto:  { color: '#00FF66', fontSize: 11, fontWeight: '700', letterSpacing: 1 },

});
