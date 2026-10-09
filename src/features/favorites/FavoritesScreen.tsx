import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import type { FlightDto } from '../../api/flight.types';
import { FlightCard } from '../../components/FlightCard';
import { StateView } from '../../components/StateView';
import { colors } from '../../components/theme';
import type { TabScreenProps } from '../../navigation/types';
import { useFavorites } from './favoritesStore';

/** Independent of the list's filter and sort: shows every saved flight, most recently added first. */
export function FavoritesScreen({ navigation }: TabScreenProps<'Favorites'>) {
  const favorites = useFavorites(state => state.favorites);
  const hasHydrated = useFavorites(state => state.hasHydrated);

  // Sorted here rather than in the selector: a selector returning a new array each time would re-render forever.
  const flights = useMemo(
    () =>
      Object.values(favorites)
        .sort((a, b) => b.addedAt - a.addedAt)
        .map(entry => entry.flight),
    [favorites],
  );

  const openDetail = useCallback((flight: FlightDto) => navigation.navigate('FlightDetail', { flight }), [navigation]);

  const renderItem: ListRenderItem<FlightDto> = useCallback(
    ({ item }) => <FlightCard flight={item} onPress={openDetail} />,
    [openDetail],
  );

  // Until storage is read we do not know yet whether there are favorites: show loading, not "no favorites".
  if (!hasHydrated) {
    return <StateView kind="loading" />;
  }

  if (flights.length === 0) {
    return <StateView kind="message" message="Henüz favori uçuşun yok." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={flights}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingVertical: 6 },
});
