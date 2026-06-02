import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { buscarLocalizacoes } from '../database/db';

export default function MapaScreen({ onBack, coordsAtuais }) {
  const [salvos, setSalvos] = useState([]);

  useEffect(() => {
    buscarLocalizacoes().then(setSalvos);
  }, []);

  if (!coordsAtuais) {
    return (
      <View style={s.container}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.aviso}>GPS não disponível.</Text>
      </View>
    );
  }

  const regiao = {
    latitude: coordsAtuais.latitude,
    longitude: coordsAtuais.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.titulo}>Mapa</Text>
      </View>

      <MapView style={s.mapa} initialRegion={regiao} showsUserLocation showsMyLocationButton>
        {salvos.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            title={item.label || '(sem rótulo)'}
            description={item.endereco || `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`}
            pinColor="#e94560"
          />
        ))}
      </MapView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header:    { paddingTop: 48, paddingHorizontal: 24, paddingBottom: 12 },
  voltar:    { color: '#a2a8d3', fontSize: 16, marginBottom: 8 },
  titulo:    { fontSize: 24, fontWeight: 'bold', color: '#e94560' },
  mapa:      { flex: 1 },
  aviso:     { color: '#a2a8d3', textAlign: 'center', marginTop: 48, padding: 24 },
});
