import React from 'react';
import { View, StyleSheet } from 'react-native';

const SZ = 10;
const TH = 1.5;

export default function TacCard({ children, style, color = 'rgba(0,255,102,0.45)' }) {
  return (
    <View style={[s.card, style]}>
      <View style={[s.h, { top: 0, left: 0, backgroundColor: color }]} />
      <View style={[s.v, { top: 0, left: 0, backgroundColor: color }]} />
      <View style={[s.h, { top: 0, right: 0, backgroundColor: color }]} />
      <View style={[s.v, { top: 0, right: 0, backgroundColor: color }]} />
      <View style={[s.h, { bottom: 0, left: 0, backgroundColor: color }]} />
      <View style={[s.v, { bottom: 0, left: 0, backgroundColor: color }]} />
      <View style={[s.h, { bottom: 0, right: 0, backgroundColor: color }]} />
      <View style={[s.v, { bottom: 0, right: 0, backgroundColor: color }]} />
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#12181A',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  h: { position: 'absolute', width: SZ, height: TH },
  v: { position: 'absolute', width: TH, height: SZ },
});
