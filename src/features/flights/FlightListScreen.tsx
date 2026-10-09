import { useCallback } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import type { FlightDto } from '../../api/flight.types';
import { FlightCard } from '../../components/FlightCard';
import { ListFooter } from '../../components/ListFooter';
import { StateView } from '../../components/StateView';
import { colors } from '../../components/theme';
import type { TabScreenProps } from '../../navigation/types';
import { FlightListControls } from './FlightListControls';
import { useFlights } from './useFlights';

export function FlightListScreen({ navigation }: TabScreenProps<'Flights'>) {
  const { state, changeFilters, loadMore, retryFirstPage, retryNextPage } = useFlights();

  const openDetail = useCallback((flight: FlightDto) => navigation.navigate('FlightDetail', { flight }), [navigation]);

  const renderItem: ListRenderItem<FlightDto> = useCallback(
    ({ item }) => <FlightCard flight={item} onPress={openDetail} />,
    [openDetail],
  );

  /**
   * Exactly one of: loading, error, empty, or the list.
   * When the filter or sort changes the status goes back to 'loading', so the FlatList unmounts
   * and the new result mounts a fresh list that starts at the top.
   */
  function renderBody() {
    if (state.status === 'loading') {
      return <StateView kind="loading" />;
    }

    if (state.status === 'error') {
      return (
        <StateView kind="message" message="Uçuşlar yüklenemedi." actionLabel="Tekrar dene" onAction={retryFirstPage} />
      );
    }

    if (state.items.length === 0) {
      return state.filters.onlyDirect ? (
        <StateView
          kind="message"
          message="Bu filtreyle uçuş bulunamadı."
          actionLabel="Filtreyi temizle"
          onAction={() => changeFilters({ ...state.filters, onlyDirect: false })}
        />
      ) : (
        <StateView kind="message" message="Uçuş bulunamadı." />
      );
    }

    return (
      <FlatList
        data={state.items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <ListFooter loadingMore={state.loadingMore} loadMoreError={state.loadMoreError} onRetry={retryNextPage} />
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlightListControls
        filters={state.filters}
        total={state.status === 'success' ? state.total : null}
        onChange={changeFilters}
      />
      {renderBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingVertical: 6 },
});
