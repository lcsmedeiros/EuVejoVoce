import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import MapaScreen from './src/screens/MapaScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';

export default function App() {
  const [tela, setTela] = useState('home');
  const [coordsMapa, setCoordsMapa] = useState(null);
  const [alvoFoco, setAlvoFoco] = useState(null);

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
    <>
      <StatusBar style="light" backgroundColor="#0B0F0C" />
      {renderTela()}
    </>
  );
}
