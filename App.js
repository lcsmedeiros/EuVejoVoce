import React, { useState } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import MapaScreen from './src/screens/MapaScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';

export default function App() {
  const [tela, setTela] = useState('home');
  const [coordsMapa, setCoordsMapa] = useState(null);

  function abrirMapa(coords) {
    setCoordsMapa(coords);
    setTela('mapa');
  }

  if (tela === 'mapa')     return <MapaScreen      onBack={() => setTela('home')} coordsAtuais={coordsMapa} />;
  if (tela === 'historico') return <HistoricoScreen onBack={() => setTela('home')} onVerNoMapa={abrirMapa} />;

  return <HomeScreen onVerMapa={abrirMapa} onVerHistorico={() => setTela('historico')} />;
}
