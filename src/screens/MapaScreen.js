import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Keyboard, ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { buscarLocalizacoes, salvarLocalizacao } from '../database/db';
import { buildMapHtml } from '../map/mapTemplate';

const ARMAS = [
  { id: 'granada', nome: 'GRANADA M67',      raio: 15,    cor: '#ffd60a' },
  { id: 'rpg',     nome: 'RPG-7',             raio: 150,   cor: '#ff9500' },
  { id: 'cruise',  nome: 'MÍSSIL CRUISE',     raio: 600,   cor: '#ff6000' },
  { id: 'moab',    nome: 'GBU-43 / MOAB',    raio: 1600,  cor: '#ff2d55' },
  { id: 'nuclear', nome: 'OGIVA NUCLEAR W80', raio: 12000, cor: '#cc00ff' },
];

export default function MapaScreen({ onBack, coordsAtuais, alvoFoco = null }) {
  const [salvos, setSalvos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [label, setLabel] = useState('');
  const [endereco, setEndereco] = useState('');
  const [buscandoEnd, setBuscandoEnd] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [kbPadding, setKbPadding] = useState(0);
  const [armaAtiva, setArmaAtiva] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    buscarLocalizacoes().then(setSalvos);
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => setKbPadding(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbPadding(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  async function buscarEndereco(lat, lng) {
    setBuscandoEnd(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } }
      );
      const json = await res.json();
      setEndereco(json.display_name ?? '');
    } catch {
      setEndereco('');
    } finally {
      setBuscandoEnd(false);
    }
  }

  function handleMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick') {
        setSelecionado({ lat: data.lat, lng: data.lng });
        setLabel('');
        setEndereco('');
        buscarEndereco(data.lat, data.lng);
      }
    } catch {}
  }

  function cancelarSelecao() {
    setSelecionado(null);
    setLabel('');
    setEndereco('');
    webViewRef.current?.injectJavaScript('clearSelection();true;');
  }

  function selecionarArma(arma) {
    setArmaAtiva(arma);
    webViewRef.current?.injectJavaScript(
      `setBlast(${alvoFoco.latitude}, ${alvoFoco.longitude}, ${arma.raio}, '${arma.cor}');true;`
    );
  }

  async function confirmarAlvo() {
    if (!selecionado) return;
    setSalvando(true);
    try {
      const novoLabel = label.trim() || '(sem rótulo)';
      const novoEnd = endereco || `${selecionado.lat.toFixed(5)}, ${selecionado.lng.toFixed(5)}`;
      await salvarLocalizacao({
        label: novoLabel,
        latitude: selecionado.lat,
        longitude: selecionado.lng,
        altitude: null,
        accuracy: null,
        endereco: novoEnd,
      });
      webViewRef.current?.injectJavaScript(
        `addMarker(${selecionado.lat}, ${selecionado.lng}, ${JSON.stringify(novoLabel)}, ${JSON.stringify(novoEnd)});true;`
      );
      setSelecionado(null);
      setLabel('');
      setEndereco('');
      const novos = await buscarLocalizacoes();
      setSalvos(novos);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o alvo.');
    } finally {
      setSalvando(false);
    }
  }

  if (!coordsAtuais) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={s.voltar}>← VOLTAR</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.aviso}>[ GPS NÃO DISPONÍVEL ]</Text>
      </View>
    );
  }

  const html = buildMapHtml(coordsAtuais.latitude, coordsAtuais.longitude, salvos, alvoFoco);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.voltar}>← VOLTAR</Text>
        </TouchableOpacity>
        <Text style={s.titulo}>
          {alvoFoco ? `⊕ ${alvoFoco.label || 'ALVO'}` : 'ZONA DE DESTRUIÇÃO'}
        </Text>
        <View style={s.headerLine} />
      </View>

      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          style={s.mapa}
          source={{ html }}
          javaScriptEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
          onMessage={handleMessage}
        />

        {/* Painel de seleção manual de alvo (tela inicial) */}
        {selecionado && (
          <View style={[s.painelWrapper, { bottom: kbPadding }]}>
            <View style={s.painel}>
              <View style={s.painelHeader}>
                <Text style={s.painelTitulo}>◎ ALVO SELECIONADO</Text>
                <TouchableOpacity onPress={cancelarSelecao}>
                  <Text style={s.painelFechar}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.painelCoords}>
                {selecionado.lat.toFixed(6)}, {selecionado.lng.toFixed(6)}
              </Text>

              {buscandoEnd ? (
                <ActivityIndicator color="#2E6B45" size="small" style={s.endLoading} />
              ) : endereco ? (
                <Text style={s.painelEndereco} numberOfLines={2}>{endereco}</Text>
              ) : null}

              <View style={s.painelSeparador} />

              <TextInput
                style={s.painelInput}
                placeholder="CODINOME DO ALVO..."
                placeholderTextColor="#2E6B45"
                value={label}
                onChangeText={setLabel}
                autoFocus
              />

              <TouchableOpacity
                style={[s.painelBotao, salvando && { opacity: 0.5 }]}
                onPress={confirmarAlvo}
                disabled={salvando}
              >
                {salvando
                  ? <ActivityIndicator color="#0B0F0C" size="small" />
                  : <Text style={s.painelBotaoTexto}>CONFIRMAR ALVO</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Painel de armamento (vindo do histórico) */}
        {alvoFoco != null && (
          <View style={s.painelWrapper}>
            <View style={s.painelArma}>
              {armaAtiva == null ? (
                <>
                  <Text style={s.painelArmaTitulo}>⚠  SELECIONE O ARMAMENTO</Text>
                  <View style={s.painelArmaSep} />
                  {ARMAS.map((arma) => (
                    <TouchableOpacity
                      key={arma.id}
                      style={[s.armaBtn, { borderColor: arma.cor + '60' }]}
                      onPress={() => selecionarArma(arma)}
                    >
                      <View style={[s.armaIndicador, { backgroundColor: arma.cor }]} />
                      <View style={s.armaInfo}>
                        <Text style={[s.armaNome, { color: arma.cor }]}>{arma.nome}</Text>
                        <Text style={s.armaRaio}>
                          RAIO: {arma.raio >= 1000 ? `${(arma.raio / 1000).toFixed(0)} km` : `${arma.raio} m`}
                        </Text>
                      </View>
                      <Text style={[s.armaIcone, { color: arma.cor }]}>⊕</Text>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <>
                  <View style={s.armaAtivaHeader}>
                    <View>
                      <Text style={[s.armaAtivaNome, { color: armaAtiva.cor }]}>
                        {armaAtiva.nome}
                      </Text>
                      <Text style={s.armaAtivaRaio}>
                        RAIO DE DESTRUIÇÃO:{' '}
                        {armaAtiva.raio >= 1000
                          ? `${(armaAtiva.raio / 1000).toFixed(0)} km`
                          : `${armaAtiva.raio} m`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[s.mudarArmaBtn, { borderColor: armaAtiva.cor + '60' }]}
                      onPress={() => setArmaAtiva(null)}
                    >
                      <Text style={[s.mudarArmaTxt, { color: armaAtiva.cor }]}>MUDAR ARMA</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0B0F0C' },
  header:      { paddingTop: 48, paddingHorizontal: 24, paddingBottom: 12 },
  voltar:      { color: '#2E6B45', fontSize: 12, marginBottom: 8, fontFamily: 'monospace', letterSpacing: 2 },
  titulo:      { fontSize: 16, fontWeight: '900', color: '#00FF66', letterSpacing: 2, marginBottom: 10 },
  headerLine:  { height: 1, backgroundColor: 'rgba(0, 255, 102, 0.2)' },
  mapa:        { flex: 1 },
  aviso:       { color: '#2E6B45', textAlign: 'center', marginTop: 48, padding: 24, fontFamily: 'monospace', letterSpacing: 1 },

  painelWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },

  painel: {
    backgroundColor: '#0B0F0C',
    borderTopWidth: 1,
    borderTopColor: '#ffd60a',
    borderLeftWidth: 3,
    borderLeftColor: '#ffd60a',
    padding: 20,
    paddingBottom: 28,
  },
  painelHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  painelTitulo:    { color: '#ffd60a', fontSize: 12, fontWeight: '900', letterSpacing: 2, fontFamily: 'monospace' },
  painelFechar:    { color: '#2E6B45', fontSize: 18, paddingLeft: 16 },
  painelCoords:    { color: '#356B49', fontSize: 11, fontFamily: 'monospace', marginBottom: 6 },
  painelEndereco:  { color: '#2E6B45', fontSize: 10, fontFamily: 'monospace', marginBottom: 10, lineHeight: 16 },
  endLoading:      { alignSelf: 'flex-start', marginBottom: 10 },
  painelSeparador: { height: 1, backgroundColor: 'rgba(255,214,10,0.15)', marginBottom: 12 },
  painelInput: {
    backgroundColor: '#0E1411',
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.3)',
    borderRadius: 4,
    padding: 12,
    fontSize: 13,
    color: '#C2E8CE',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 12,
  },
  painelBotao:      { backgroundColor: '#ffd60a', padding: 14, borderRadius: 4, alignItems: 'center' },
  painelBotaoTexto: { color: '#0B0F0C', fontSize: 12, fontWeight: '900', letterSpacing: 2 },

  painelArma: {
    backgroundColor: '#0B0F0C',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,45,85,0.4)',
    borderLeftWidth: 3,
    borderLeftColor: '#ff2d55',
    padding: 16,
    paddingBottom: 24,
  },
  painelArmaTitulo: { color: '#ff2d55', fontSize: 10, fontWeight: '900', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 10 },
  painelArmaSep:    { height: 1, backgroundColor: 'rgba(255,45,85,0.15)', marginBottom: 10 },

  armaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  armaIndicador: { width: 4, height: 36, borderRadius: 2, marginRight: 12 },
  armaInfo:      { flex: 1 },
  armaNome:      { fontSize: 12, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace', marginBottom: 2 },
  armaRaio:      { color: '#2E6B45', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 },
  armaIcone:     { fontSize: 18, fontWeight: '900' },

  armaAtivaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  armaAtivaNome: { fontSize: 14, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace', marginBottom: 4 },
  armaAtivaRaio: { color: '#356B49', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 },
  mudarArmaBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mudarArmaTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' },
});
