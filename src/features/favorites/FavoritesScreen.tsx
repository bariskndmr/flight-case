import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { FlightDto } from '../../api/flight.types';
import { FlightCardList } from '../../components/FlightCardList';
import { StateView } from '../../components/StateView';
import { colors } from '../../components/theme';
import type { TabScreenProps } from '../../navigation/types';
import { favoritesNewestFirst, useFavorites } from './favoritesStore';

/** Independent of the list's filter and sort: shows every saved flight, most recently added first. */
export function FavoritesScreen({ navigation }: TabScreenProps<'Favorites'>) {
  const favorites = useFavorites(state => state.favorites);
  const hasHydrated = useFavorites(state => state.hasHydrated);
  const flights = useMemo(() => favoritesNewestFirst(favorites), [favorites]);

  const openDetail = useCallback((flight: FlightDto) => navigation.navigate('FlightDetail', { flight }), [navigation]);

  // Until storage is read we do not know yet whether there are favorites: show loading, not "no favorites".
  if (!hasHydrated) {
    return <StateView kind="loading" />;
  }

  if (flights.length === 0) {
    return <StateView kind="message" message="Henüz favori uçuşun yok." />;
  }

  return (
    <View style={styles.container}>
      <FlightCardList flights={flights} onPressFlight={openDetail} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
