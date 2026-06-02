import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from '../styles/globalStyles';

export default function TodoScreen({ onBack }) {
  const [tarefas, setTarefas] = useState([]);
  const [texto, setTexto] = useState('');

  const adicionar = () => {
    if (texto.trim() === '') return;
    setTarefas([...tarefas, { id: Date.now(), texto: texto.trim(), feita: false }]);
    setTexto('');
  };

  const marcarFeita = (id) => {
    setTarefas(
      tarefas.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t))
    );
  };

  const remover = (id) => {
    setTarefas(tarefas.filter((t) => t.id !== id));
  };

  return (
    <>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
              <Text style={{ color: '#7FB89A', fontSize: 16 }}>← Voltar</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Minhas Tarefas</Text>
          <Text style={styles.subtitle}>
            {tarefas.filter((t) => t.feita).length} de {tarefas.length} concluídas
          </Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nova tarefa..."
            placeholderTextColor="#5C8C6E"
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={adicionar}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.btnAdd} onPress={adicionar}>
            <Text style={styles.btnAddText}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.lista}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {tarefas.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma tarefa. Adicione uma acima.</Text>
          )}
          {tarefas.map((t) => (
            <View key={t.id} style={[styles.card, t.feita && styles.cardFeita]}>
              <TouchableOpacity
                style={styles.checkArea}
                onPress={() => marcarFeita(t.id)}
              >
                <View style={[styles.checkbox, t.feita && styles.checkboxFeita]}>
                  {t.feita && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.taskText, t.feita && styles.taskTextFeita]}>
                  {t.texto}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnRemover}
                onPress={() => remover(t.id)}
              >
                <Text style={styles.btnRemoverText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
