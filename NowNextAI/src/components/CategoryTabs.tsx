import { StyleSheet, Text, View } from 'react-native';

export function CategoryTabs() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Category tabs placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  text: {
    color: '#334155',
    fontWeight: '500',
  },
});
