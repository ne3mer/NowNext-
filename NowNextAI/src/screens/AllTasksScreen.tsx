import { StyleSheet, Text, View } from 'react-native';

export function AllTasksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Tasks</Text>
      <Text style={styles.subtitle}>Category-based list will be added soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#475569',
  },
});
