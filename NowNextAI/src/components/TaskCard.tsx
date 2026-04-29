import { StyleSheet, Text, View } from 'react-native';

export function TaskCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Task card placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#fde68a',
    padding: 16,
  },
  title: {
    color: '#1f2937',
    fontWeight: '600',
  },
});
