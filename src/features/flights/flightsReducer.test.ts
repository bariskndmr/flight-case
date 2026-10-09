import { makePage } from '../../test/fixtures';
import { flightsReducer, initialFlightsState, type FlightsAction, type FlightsState } from './flightsReducer';

function run(actions: FlightsAction[], from: FlightsState = initialFlightsState): FlightsState {
  return actions.reduce(flightsReducer, from);
}

/** Two pages of the default (price, all flights) list are on screen and more are available. */
const twoPagesLoaded = run([
  { type: 'FIRST_PAGE_REQUESTED', requestId: 1 },
  { type: 'PAGE_SUCCEEDED', requestId: 1, page: 1, response: makePage(['FL004', 'FL009'], { total: 24, hasMore: true }) },
  { type: 'NEXT_PAGE_REQUESTED', requestId: 2 },
  {
    type: 'PAGE_SUCCEEDED',
    requestId: 2,
    page: 2,
    response: makePage(['FL024', 'FL017'], { page: 2, total: 24, hasMore: true }),
  },
]);

const ids = (state: FlightsState) => state.items.map(f => f.id);

describe('flightsReducer', () => {
  it('starts on a first-page load with the default filters', () => {
    expect(initialFlightsState).toMatchObject({
      status: 'loading',
      items: [],
      filters: { sort: 'price', onlyDirect: false },
    });
  });

  it('appends the next page after the first one', () => {
    expect(ids(twoPagesLoaded)).toEqual(['FL004', 'FL009', 'FL024', 'FL017']);
    expect(twoPagesLoaded).toMatchObject({ status: 'success', page: 2, total: 24, hasMore: true, loadingMore: false });
  });

  describe('when the filter or sort changes', () => {
    it('resets paging and drops the old items', () => {
      const state = flightsReducer(twoPagesLoaded, {
        type: 'FILTERS_CHANGED',
        filters: { sort: 'price', onlyDirect: true },
        requestId: 3,
      });

      expect(state).toMatchObject({
        filters: { sort: 'price', onlyDirect: true },
        status: 'loading',
        items: [],
        page: 0,
        total: 0,
        hasMore: false,
        loadingMore: false,
        loadMoreError: false,
      });
    });

    it('starts the new result from page 1 without mixing in old pages', () => {
      const state = run(
        [
          { type: 'FILTERS_CHANGED', filters: { sort: 'duration', onlyDirect: false }, requestId: 3 },
          {
            type: 'PAGE_SUCCEEDED',
            requestId: 3,
            page: 1,
            response: makePage(['FL003', 'FL011'], { total: 24, hasMore: true, sort: 'duration' }),
          },
        ],
        twoPagesLoaded,
      );

      expect(ids(state)).toEqual(['FL003', 'FL011']);
      expect(state.page).toBe(1);
    });

    it('also clears a pending next-page load or its error', () => {
      const loadingMore = flightsReducer(twoPagesLoaded, { type: 'NEXT_PAGE_REQUESTED', requestId: 3 });
      const failedMore = flightsReducer(loadingMore, { type: 'PAGE_FAILED', requestId: 3, page: 3 });

      for (const before of [loadingMore, failedMore]) {
        const after = flightsReducer(before, {
          type: 'FILTERS_CHANGED',
          filters: { sort: 'price', onlyDirect: true },
          requestId: 4,
        });
        expect(after).toMatchObject({ loadingMore: false, loadMoreError: false, items: [] });
      }
    });
  });

  describe('stale responses', () => {
    it('ignores a late first-page response from the previous filter', () => {
      // Race: price list requested (1), user switches to duration (2), duration answers first, price answers last.
      const state = run([
        { type: 'FIRST_PAGE_REQUESTED', requestId: 1 },
        { type: 'FILTERS_CHANGED', filters: { sort: 'duration', onlyDirect: false }, requestId: 2 },
        { type: 'PAGE_SUCCEEDED', requestId: 2, page: 1, response: makePage(['FL003'], { sort: 'duration' }) },
        { type: 'PAGE_SUCCEEDED', requestId: 1, page: 1, response: makePage(['FL004']) },
      ]);

      expect(ids(state)).toEqual(['FL003']);
      expect(state.filters.sort).toBe('duration');
    });

    it('ignores a late next-page response that belongs to the previous filter', () => {
      const state = run(
        [
          { type: 'NEXT_PAGE_REQUESTED', requestId: 3 },
          { type: 'FILTERS_CHANGED', filters: { sort: 'price', onlyDirect: true }, requestId: 4 },
          { type: 'PAGE_SUCCEEDED', requestId: 3, page: 3, response: makePage(['FL016'], { page: 3, total: 24 }) },
        ],
        twoPagesLoaded,
      );

      expect(state).toMatchObject({ status: 'loading', items: [], page: 0 });
    });

    it('ignores a stale error so it cannot replace a newer result', () => {
      const state = run([
        { type: 'FIRST_PAGE_REQUESTED', requestId: 1 },
        { type: 'FILTERS_CHANGED', filters: { sort: 'duration', onlyDirect: false }, requestId: 2 },
        { type: 'PAGE_SUCCEEDED', requestId: 2, page: 1, response: makePage(['FL003'], { sort: 'duration' }) },
        { type: 'PAGE_FAILED', requestId: 1, page: 1 },
      ]);

      expect(state.status).toBe('success');
      expect(ids(state)).toEqual(['FL003']);
    });
  });

  describe('errors', () => {
    it('marks the first page as failed without any items', () => {
      const state = run([
        { type: 'FIRST_PAGE_REQUESTED', requestId: 1 },
        { type: 'PAGE_FAILED', requestId: 1, page: 1 },
      ]);

      expect(state).toMatchObject({ status: 'error', items: [] });
    });

    it('keeps the loaded items when a next page fails', () => {
      const state = run(
        [
          { type: 'NEXT_PAGE_REQUESTED', requestId: 3 },
          { type: 'PAGE_FAILED', requestId: 3, page: 3 },
        ],
        twoPagesLoaded,
      );

      expect(ids(state)).toEqual(['FL004', 'FL009', 'FL024', 'FL017']);
      expect(state).toMatchObject({ status: 'success', page: 2, loadingMore: false, loadMoreError: true });
    });

    it('recovers when the failed next page is retried', () => {
      const state = run(
        [
          { type: 'NEXT_PAGE_REQUESTED', requestId: 3 },
          { type: 'PAGE_FAILED', requestId: 3, page: 3 },
          { type: 'NEXT_PAGE_REQUESTED', requestId: 4 },
          {
            type: 'PAGE_SUCCEEDED',
            requestId: 4,
            page: 3,
            response: makePage(['FL016'], { page: 3, total: 24, hasMore: false }),
          },
        ],
        twoPagesLoaded,
      );

      expect(ids(state)).toEqual(['FL004', 'FL009', 'FL024', 'FL017', 'FL016']);
      expect(state).toMatchObject({ loadMoreError: false, hasMore: false, page: 3 });
    });

    it('recovers when the failed first page is retried', () => {
      const state = run([
        { type: 'FIRST_PAGE_REQUESTED', requestId: 1 },
        { type: 'PAGE_FAILED', requestId: 1, page: 1 },
        { type: 'FIRST_PAGE_REQUESTED', requestId: 2 },
        { type: 'PAGE_SUCCEEDED', requestId: 2, page: 1, response: makePage(['FL004']) },
      ]);

      expect(state.status).toBe('success');
      expect(ids(state)).toEqual(['FL004']);
    });
  });

  it('treats an empty first page as a successful, empty result', () => {
    const state = run([
      { type: 'FIRST_PAGE_REQUESTED', requestId: 1 },
      { type: 'PAGE_SUCCEEDED', requestId: 1, page: 1, response: makePage([], { total: 0 }) },
    ]);

    expect(state).toMatchObject({ status: 'success', items: [], total: 0, hasMore: false });
  });
});
