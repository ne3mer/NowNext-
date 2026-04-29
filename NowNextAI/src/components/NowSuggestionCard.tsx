import { StyleSheet, Text, View } from 'react-native';

export function NowSuggestionCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What should I do now?</Text>
      <Text style={styles.subtitle}>Suggestion card placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  subtitle: {
    marginTop: 4,
    color: '#1d4ed8',
  },
});
