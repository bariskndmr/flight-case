import { StyleSheet, Text, View } from 'react-native';
import type { FlightDetailScreenProps } from '../../navigation/types';

// Placeholder: replaced by the real detail screen in block 3.
export function FlightDetailScreen({ route }: FlightDetailScreenProps) {
  return (
    <View style={styles.container}>
      <Text>{route.params.flight.flightNumber}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
