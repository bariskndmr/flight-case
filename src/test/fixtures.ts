import type { FlightDto, FlightListResponse } from '../api/flight.types';
import type { FlightFilters } from '../api/flights';

/** A flight shaped like the mock service data; override only what a test cares about. */
export function makeFlight(overrides: Partial<FlightDto> = {}): FlightDto {
  return {
    id: 'FL013',
    flightNumber: 'TA544',
    airline: 'Toros Air',
    origin: { code: 'IST', city: 'İstanbul', name: 'İstanbul Havalimanı' },
    destination: { code: 'AYT', city: 'Antalya', name: 'Antalya Havalimanı' },
    departureAt: '2026-10-15T13:25:00+03:00',
    arrivalAt: '2026-10-15T14:35:00+03:00',
    durationMinutes: 70,
    stops: 0,
    priceMinor: 355000,
    currency: 'TRY',
    baggageKg: 20,
    ...overrides,
  };
}

export function makePage(
  ids: string[],
  { page = 1, total = ids.length, hasMore = false, sort = 'price', onlyDirect = false }: Partial<FlightFilters> & {
    page?: number;
    total?: number;
    hasMore?: boolean;
  } = {},
): FlightListResponse {
  return {
    items: ids.map(id => makeFlight({ id })),
    meta: { page, limit: 8, total, totalPages: Math.max(1, Math.ceil(total / 8)), hasMore, sort, onlyDirect },
  };
}
