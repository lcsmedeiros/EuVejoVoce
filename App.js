import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './src/screens/HomeScreen';
import MapaScreen from './src/screens/MapaScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [tela, setTela] = useState('home');
  const [coordsMapa, setCoordsMapa] = useState(null);
  const [alvoFoco, setAlvoFoco] = useState(null);
  const [fontsLoaded, fontError] = useFonts({ ShareTechMono_400Regular });

  const onLayout = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  function abrirMapa(coords, foco = null) {
    setCoordsMapa(coords);
    setAlvoFoco(foco);
    setTela('mapa');
  }

  function renderTela() {
    if (tela === 'mapa')      return <MapaScreen      onBack={() => setTela('home')} coordsAtuais={coordsMapa} alvoFoco={alvoFoco} />;
    if (tela === 'historico') return <HistoricoScreen onBack={() => setTela('home')} onVerNoMapa={abrirMapa} />;
    return <HomeScreen onVerMapa={abrirMapa} onVerHistorico={() => setTela('historico')} />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <StatusBar style="light" backgroundColor="#0B0F0C" />
      {renderTela()}
    </View>
  );
}
