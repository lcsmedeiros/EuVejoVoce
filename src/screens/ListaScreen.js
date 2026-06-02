import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

const ITENS = [
  { id: '1', nome: 'React Native', desc: 'Framework para apps nativos' },
  { id: '2', nome: 'JavaScript', desc: 'Linguagem do projeto' },
  { id: '3', nome: 'Expo', desc: 'Ferramentas e build simplificado' },
  { id: '4', nome: 'StyleSheet', desc: 'Estilos tipo CSS no React Native' },
];

export default function ListaScreen({ onBack }) {
  return (
    <View style={globalStyles.container}>
      <Header title="Lista de Itens" onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {ITENS.map((item) => (
          <View key={item.id} style={globalStyles.card}>
            <Text style={globalStyles.title}>{item.nome}</Text>
            <Text style={globalStyles.subtitle}>{item.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
