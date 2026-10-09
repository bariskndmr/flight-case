import { getJson } from './client';
import type { FlightListResponse, FlightSort } from './flight.types';

export const PAGE_SIZE = 8;

/** What the user controls on the list screen. Both are applied by the server, never on the client. */
export type FlightFilters = {
  sort: FlightSort;
  onlyDirect: boolean;
};

export const DEFAULT_FILTERS: FlightFilters = { sort: 'price', onlyDirect: false };

export type FlightPageParams = FlightFilters & { page: number };

/**
 * Every parameter is sent explicitly, even when it equals the server default,
 * so the request in the log always tells the whole story.
 * Values are a number, an enum and a boolean, so no URL encoding is needed.
 */
export function buildFlightsQuery({ page, sort, onlyDirect }: FlightPageParams): string {
  return `page=${page}&limit=${PAGE_SIZE}&sort=${sort}&onlyDirect=${onlyDirect}`;
}

export function getFlights(params: FlightPageParams, signal?: AbortSignal): Promise<FlightListResponse> {
  return getJson<FlightListResponse>(`/flights?${buildFlightsQuery(params)}`, signal);
}
