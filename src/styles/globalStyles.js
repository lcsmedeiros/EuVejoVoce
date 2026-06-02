/**
 * Estilos do app (CSS-like)
 * React Native usa StyleSheet: mesmas ideias de CSS (flex, padding, color, etc.)
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#a2a8d3',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#eee',
  },
  btnAdd: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAddText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  lista: {
    flex: 1,
  },
  emptyText: {
    color: '#6b7aa1',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardFeita: {
    opacity: 0.7,
    backgroundColor: '#1a2744',
  },
  checkArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxFeita: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  checkMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 16,
    color: '#eee',
    flex: 1,
  },
  taskTextFeita: {
    textDecorationLine: 'line-through',
    color: '#a2a8d3',
  },
  btnRemover: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnRemoverText: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos usados em Home, Lista, Perfil
  button: {
    backgroundColor: '#e94560',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e94560',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#e94560',
  },
});

export const globalStyles = styles;
