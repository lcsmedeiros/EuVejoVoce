import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

export default function PerfilScreen({ onBack }) {
  const [nome, setNome] = useState('');

  return (
    <View style={globalStyles.container}>
      <Header title="Meu Perfil" onBack={onBack} />

      <View style={globalStyles.card}>
        <Text style={globalStyles.subtitle}>Digite seu nome:</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Seu nome"
          placeholderTextColor="#6b7aa1"
          value={nome}
          onChangeText={setNome}
        />
        {nome.length > 0 && (
          <Text style={[globalStyles.subtitle, { marginTop: 8 }]}>
            Olá, {nome}! 👋
          </Text>
        )}
      </View>
    </View>
  );
}
