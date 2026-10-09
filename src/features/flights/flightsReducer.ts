import type { FlightDto, FlightListResponse } from '../../api/flight.types';
import { DEFAULT_FILTERS, type FlightFilters } from '../../api/flights';

/**
 * List state for one filter/sort combination.
 *
 * - `status` describes the first page only, so loading / error / empty can never show at the same time.
 * - `loadingMore` / `loadMoreError` describe later pages; the items already on screen stay put.
 * - `requestId` is the id of the latest request. A response with any other id is stale
 *   (the filter changed, or the server answered out of order) and is ignored.
 */
export type FlightsState = {
  filters: FlightFilters;
  status: 'loading' | 'success' | 'error';
  items: FlightDto[];
  /** Last page that loaded successfully. 0 before the first page arrives. */
  page: number;
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreError: boolean;
  requestId: number;
};

export type FlightsAction =
  | { type: 'FIRST_PAGE_REQUESTED'; requestId: number }
  | { type: 'FILTERS_CHANGED'; filters: FlightFilters; requestId: number }
  | { type: 'NEXT_PAGE_REQUESTED'; requestId: number }
  | { type: 'PAGE_SUCCEEDED'; requestId: number; page: number; response: FlightListResponse }
  | { type: 'PAGE_FAILED'; requestId: number; page: number };

export const initialFlightsState: FlightsState = {
  filters: DEFAULT_FILTERS,
  status: 'loading',
  items: [],
  page: 0,
  total: 0,
  hasMore: false,
  loadingMore: false,
  loadMoreError: false,
  requestId: 0,
};

/** Back to an empty first-page load: no items or page from the previous result may leak into the new one. */
function resetForFirstPage(filters: FlightFilters, requestId: number): FlightsState {
  return { ...initialFlightsState, filters, requestId };
}

export function flightsReducer(state: FlightsState, action: FlightsAction): FlightsState {
  switch (action.type) {
    case 'FIRST_PAGE_REQUESTED':
      return resetForFirstPage(state.filters, action.requestId);

    case 'FILTERS_CHANGED':
      return resetForFirstPage(action.filters, action.requestId);

    case 'NEXT_PAGE_REQUESTED':
      return { ...state, loadingMore: true, loadMoreError: false, requestId: action.requestId };

    case 'PAGE_SUCCEEDED': {
      if (action.requestId !== state.requestId) return state;
      const { items, meta } = action.response;
      return {
        ...state,
        status: 'success',
        items: action.page === 1 ? items : [...state.items, ...items],
        page: meta.page,
        total: meta.total,
        hasMore: meta.hasMore,
        loadingMore: false,
        loadMoreError: false,
      };
    }

    case 'PAGE_FAILED': {
      if (action.requestId !== state.requestId) return state;
      if (action.page === 1) {
        return { ...state, status: 'error' };
      }
      // A failed next page keeps everything already loaded; the footer offers a retry.
      return { ...state, loadingMore: false, loadMoreError: true };
    }
  }
}
