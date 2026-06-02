import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090f',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#2a4060',
    letterSpacing: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0f1a',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 4,
    padding: 14,
    fontSize: 13,
    color: '#c5dce8',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  btnAdd: {
    width: 52,
    height: 52,
    borderRadius: 4,
    backgroundColor: '#00e5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAddText: {
    color: '#07090f',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  lista: {
    flex: 1,
  },
  emptyText: {
    color: '#2a4060',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#0b1019',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#00e5ff',
    padding: 16,
    marginBottom: 10,
  },
  checkArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxFeita: {
    backgroundColor: '#00e5ff',
    borderColor: '#00e5ff',
  },
  checkMark: {
    color: '#07090f',
    fontSize: 13,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 14,
    color: '#c5dce8',
    flex: 1,
    letterSpacing: 0.5,
  },
  taskTextFeita: {
    textDecorationLine: 'line-through',
    color: '#2a4060',
  },
  btnRemover: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnRemoverText: {
    color: '#ff2d55',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#00e5ff',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  buttonText: {
    color: '#07090f',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  buttonTextSecondary: {
    color: '#00e5ff',
  },
});

export const globalStyles = styles;
