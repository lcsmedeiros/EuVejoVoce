import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F0C',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00FF66',
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#2E6B45',
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
    backgroundColor: '#0E1411',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.25)',
    borderRadius: 4,
    padding: 14,
    fontSize: 13,
    color: '#C2E8CE',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  btnAdd: {
    width: 52,
    height: 52,
    borderRadius: 4,
    backgroundColor: '#00FF66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAddText: {
    color: '#0B0F0C',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  lista: {
    flex: 1,
  },
  emptyText: {
    color: '#2E6B45',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#12181A',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#00FF66',
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
    borderColor: 'rgba(0, 255, 102, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxFeita: {
    backgroundColor: '#00FF66',
    borderColor: '#00FF66',
  },
  checkMark: {
    color: '#0B0F0C',
    fontSize: 13,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 14,
    color: '#C2E8CE',
    flex: 1,
    letterSpacing: 0.5,
  },
  taskTextFeita: {
    textDecorationLine: 'line-through',
    color: '#2E6B45',
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
    backgroundColor: '#00FF66',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  buttonText: {
    color: '#0B0F0C',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  buttonTextSecondary: {
    color: '#00FF66',
  },
});

export const globalStyles = styles;
