import { StyleSheet, Text, View } from 'react-native';
import type { TabScreenProps } from '../../navigation/types';

// Placeholder: replaced by the real favorites screen in block 4.
export function FavoritesScreen(_props: TabScreenProps<'Favorites'>) {
  return (
    <View style={styles.container}>
      <Text>Favoriler</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
