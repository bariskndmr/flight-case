import { useCallback, useEffect, useReducer, useRef } from 'react';
import { isAbortError } from '../../api/client';
import { getFlights, type FlightFilters } from '../../api/flights';
import { flightsReducer, initialFlightsState } from './flightsReducer';

/**
 * Owns the list's async flow: which page to ask for, when, and which answer to keep.
 * The reducer decides what a response does to state; this hook only starts and cancels requests.
 */
export function useFlights() {
  const [state, dispatch] = useReducer(flightsReducer, initialFlightsState);

  // Each request gets a new id; the reducer drops responses whose id is not the latest.
  const lastRequestId = useRef(0);
  // Only one request is in flight at a time; starting a new one cancels the previous.
  const inFlight = useRef<AbortController | null>(null);
  // onEndReached can fire several times before React re-renders with loadingMore=true,
  // so the "already loading" guard must be synchronous.
  const isLoadingMore = useRef(false);

  const startRequest = useCallback(() => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    lastRequestId.current += 1;
    return { requestId: lastRequestId.current, signal: controller.signal };
  }, []);

  const fetchPage = useCallback(
    async (page: number, filters: FlightFilters, requestId: number, signal: AbortSignal) => {
      try {
        const response = await getFlights({ page, ...filters }, signal);
        dispatch({ type: 'PAGE_SUCCEEDED', requestId, page, response });
      } catch (error) {
        // Cancelled on purpose (filter changed or screen left): not an error for the user.
        if (isAbortError(error)) return;
        if (__DEV__) console.log(`[flights] page ${page} failed`, error);
        dispatch({ type: 'PAGE_FAILED', requestId, page });
      } finally {
        if (requestId === lastRequestId.current) {
          isLoadingMore.current = false;
        }
      }
    },
    [],
  );

  const loadFirstPage = useCallback(
    (filters: FlightFilters) => {
      isLoadingMore.current = false;
      const { requestId, signal } = startRequest();
      dispatch({ type: 'FIRST_PAGE_REQUESTED', requestId });
      void fetchPage(1, filters, requestId, signal);
    },
    [startRequest, fetchPage],
  );

  const changeFilters = useCallback(
    (filters: FlightFilters) => {
      isLoadingMore.current = false;
      const { requestId, signal } = startRequest();
      dispatch({ type: 'FILTERS_CHANGED', filters, requestId });
      void fetchPage(1, filters, requestId, signal);
    },
    [startRequest, fetchPage],
  );

  const requestNextPage = useCallback(() => {
    isLoadingMore.current = true;
    const { requestId, signal } = startRequest();
    dispatch({ type: 'NEXT_PAGE_REQUESTED', requestId });
    void fetchPage(state.page + 1, state.filters, requestId, signal);
  }, [startRequest, fetchPage, state.page, state.filters]);

  /** Called from onEndReached. A failed page is not retried by scrolling; the user taps "Tekrar dene". */
  const loadMore = useCallback(() => {
    const canLoadMore = state.status === 'success' && state.hasMore && !state.loadMoreError;
    if (!canLoadMore || isLoadingMore.current) return;
    requestNextPage();
  }, [state.status, state.hasMore, state.loadMoreError, requestNextPage]);

  const retryNextPage = useCallback(() => {
    if (state.status !== 'success' || !state.hasMore || isLoadingMore.current) return;
    requestNextPage();
  }, [state.status, state.hasMore, requestNextPage]);

  const retryFirstPage = useCallback(() => loadFirstPage(state.filters), [loadFirstPage, state.filters]);

  /** "Filtreyi temizle": turns the direct-only filter off and keeps the chosen sort. */
  const clearDirectFilter = useCallback(
    () => changeFilters({ ...state.filters, onlyDirect: false }),
    [changeFilters, state.filters],
  );

  // Load the first page once on mount; cancel whatever is still in flight on unmount.
  useEffect(() => {
    loadFirstPage(initialFlightsState.filters);
    return () => inFlight.current?.abort();
  }, [loadFirstPage]);

  return { state, changeFilters, clearDirectFilter, loadMore, retryFirstPage, retryNextPage };
}
