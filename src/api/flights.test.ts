import { ApiError } from './client';
import { buildFlightsQuery, DEFAULT_FILTERS, getFlights } from './flights';

describe('buildFlightsQuery', () => {
  it('sends the defaults explicitly: first page, limit 8, cheapest first, all flights', () => {
    expect(buildFlightsQuery({ page: 1, ...DEFAULT_FILTERS })).toBe('page=1&limit=8&sort=price&onlyDirect=false');
  });

  it('sends sort=duration when sorting by shortest duration', () => {
    expect(buildFlightsQuery({ page: 1, sort: 'duration', onlyDirect: false })).toBe(
      'page=1&limit=8&sort=duration&onlyDirect=false',
    );
  });

  it('sends onlyDirect=true when the direct-only filter is on', () => {
    expect(buildFlightsQuery({ page: 1, sort: 'price', onlyDirect: true })).toBe(
      'page=1&limit=8&sort=price&onlyDirect=true',
    );
  });

  it('carries the requested page number', () => {
    expect(buildFlightsQuery({ page: 3, sort: 'duration', onlyDirect: true })).toBe(
      'page=3&limit=8&sort=duration&onlyDirect=true',
    );
  });
});

describe('getFlights', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  it('requests /flights with the built query and returns the body', async () => {
    const body = { items: [], meta: { page: 2, limit: 8, total: 0, totalPages: 1, hasMore: false } };
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(body) });

    const result = await getFlights({ page: 2, sort: 'price', onlyDirect: true });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/flights?page=2&limit=8&sort=price&onlyDirect=true',
      expect.anything(),
    );
    expect(result).toEqual(body);
  });

  it('turns the service error body into an ApiError', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: { code: 'FLIGHTS_UNAVAILABLE', message: 'Uçuşlar yüklenemedi.' } }),
    });

    const error = await getFlights({ page: 1, ...DEFAULT_FILTERS }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500, code: 'FLIGHTS_UNAVAILABLE' });
  });
});
