import { StyleSheet, Text, View } from 'react-native';
import type { TabScreenProps } from '../../navigation/types';

// Placeholder: replaced by the real list in block 2.
export function FlightListScreen(_props: TabScreenProps<'Flights'>) {
  return (
    <View style={styles.container}>
      <Text>Uçuşlar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
