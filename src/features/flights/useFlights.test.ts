import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { FlightListResponse } from '../../api/flight.types';
import { getFlights } from '../../api/flights';
import { makePage } from '../../test/fixtures';
import { useFlights } from './useFlights';

jest.mock('../../api/flights', () => ({
  ...jest.requireActual('../../api/flights'),
  getFlights: jest.fn(),
}));

const getFlightsMock = jest.mocked(getFlights);

/** A promise the test resolves or rejects by hand, to hold a request "in flight". */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const firstPage = makePage(['FL004', 'FL009', 'FL006', 'FL015', 'FL002', 'FL021', 'FL012', 'FL018'], {
  total: 24,
  hasMore: true,
});

const requestedPages = () => getFlightsMock.mock.calls.map(([params]) => params.page);

async function renderWithFirstPage(response: FlightListResponse = firstPage) {
  getFlightsMock.mockResolvedValueOnce(response);
  const hook = await renderHook(() => useFlights());
  await waitFor(() => expect(hook.result.current.state.status).toBe('success'));
  return hook;
}

beforeEach(() => {
  getFlightsMock.mockReset();
});

describe('useFlights', () => {
  it('loads page 1 with the default filters on mount', async () => {
    const { result } = await renderWithFirstPage();

    expect(getFlightsMock).toHaveBeenCalledTimes(1);
    expect(getFlightsMock.mock.calls[0][0]).toEqual({ page: 1, sort: 'price', onlyDirect: false });
    expect(result.current.state.items).toHaveLength(8);
  });

  it('requests the next page only once when onEndReached fires repeatedly', async () => {
    const { result } = await renderWithFirstPage();
    getFlightsMock.mockReturnValueOnce(deferred<FlightListResponse>().promise);

    // Same render, same closure: exactly what a burst of onEndReached calls looks like.
    await act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });
    // And again after the re-render, while page 2 is still loading.
    await act(() => result.current.loadMore());

    expect(requestedPages()).toEqual([1, 2]);
    expect(result.current.state.loadingMore).toBe(true);
  });

  it('stops asking once hasMore is false', async () => {
    const { result } = await renderWithFirstPage(makePage(['FL004'], { total: 1, hasMore: false }));

    await act(() => result.current.loadMore());

    expect(requestedPages()).toEqual([1]);
  });

  it('does not retry a failed next page on scroll, only on "Tekrar dene"', async () => {
    const { result } = await renderWithFirstPage();
    getFlightsMock.mockRejectedValueOnce(new Error('500'));

    await act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.state.loadMoreError).toBe(true));

    await act(() => result.current.loadMore());
    expect(requestedPages()).toEqual([1, 2]);

    getFlightsMock.mockResolvedValueOnce(makePage(['FL024'], { page: 2, total: 24, hasMore: true }));
    await act(() => result.current.retryNextPage());

    await waitFor(() => expect(result.current.state.items).toHaveLength(9));
    expect(requestedPages()).toEqual([1, 2, 2]);
  });

  it('cancels the pending request and starts from page 1 when the filter changes', async () => {
    const { result } = await renderWithFirstPage();
    const pendingPage2 = deferred<FlightListResponse>();
    getFlightsMock.mockReturnValueOnce(pendingPage2.promise);
    await act(() => result.current.loadMore());

    getFlightsMock.mockResolvedValueOnce(makePage(['FL002', 'FL024'], { total: 17, onlyDirect: true }));
    await act(() => result.current.changeFilters({ sort: 'price', onlyDirect: true }));

    const page2Signal = getFlightsMock.mock.calls[1][1];
    expect(page2Signal?.aborted).toBe(true);
    expect(getFlightsMock.mock.calls[2][0]).toEqual({ page: 1, sort: 'price', onlyDirect: true });

    await waitFor(() => expect(result.current.state.items.map(f => f.id)).toEqual(['FL002', 'FL024']));

    // The old page 2 answering late must not leak into the new result.
    await act(async () => pendingPage2.resolve(makePage(['FL024'], { page: 2, total: 24, hasMore: true })));
    expect(result.current.state.items.map(f => f.id)).toEqual(['FL002', 'FL024']);
    expect(result.current.state.total).toBe(17);
  });
});
