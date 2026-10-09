import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeFlight } from '../../test/fixtures';
import { createFavoritesStore, FAVORITES_STORAGE_KEY, type FavoritesStore } from './favoritesStore';

const FL004 = makeFlight({ id: 'FL004', flightNumber: 'AE331' });
const FL013 = makeFlight({ id: 'FL013', flightNumber: 'TA544' });
const FL024 = makeFlight({ id: 'FL024', flightNumber: 'AE383' });

/** Lets AsyncStorage's async mock finish its pending reads and writes. */
const flushStorage = () => new Promise(resolve => setTimeout(resolve, 0));

async function hydrated(store: FavoritesStore): Promise<FavoritesStore> {
  if (!store.getState().hasHydrated) {
    await new Promise<void>(resolve => {
      const unsubscribe = store.subscribe(state => {
        if (state.hasHydrated) {
          unsubscribe();
          resolve();
        }
      });
    });
  }
  return store;
}

async function storedFavoriteIds(): Promise<string[]> {
  await flushStorage();
  const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
  if (raw === null) return [];
  return Object.keys(JSON.parse(raw).state.favorites);
}

const favoriteIds = (store: FavoritesStore) => Object.keys(store.getState().favorites);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('favorites store', () => {
  it('writes added and removed favorites to AsyncStorage', async () => {
    const store = await hydrated(createFavoritesStore());

    store.getState().toggleFavorite(FL004);
    store.getState().toggleFavorite(FL013);
    expect(await storedFavoriteIds()).toEqual(['FL004', 'FL013']);

    store.getState().toggleFavorite(FL004);
    expect(await storedFavoriteIds()).toEqual(['FL013']);

    store.getState().removeFavorite('FL013');
    expect(await storedFavoriteIds()).toEqual([]);
  });

  it('persists only the favorites, not the hydration flag', async () => {
    const store = await hydrated(createFavoritesStore());
    store.getState().toggleFavorite(FL004);
    await flushStorage();

    const saved = JSON.parse((await AsyncStorage.getItem(FAVORITES_STORAGE_KEY)) ?? '{}');
    expect(Object.keys(saved.state)).toEqual(['favorites']);
    expect(saved.version).toBe(1);
  });

  it('restores saved favorites, with the full flight, in a new store instance (app restart)', async () => {
    const firstLaunch = await hydrated(createFavoritesStore());
    firstLaunch.getState().toggleFavorite(FL004);
    firstLaunch.getState().toggleFavorite(FL024);
    await flushStorage();

    const secondLaunch = await hydrated(createFavoritesStore());

    expect(favoriteIds(secondLaunch)).toEqual(['FL004', 'FL024']);
    expect(secondLaunch.getState().favorites.FL024.flight).toEqual(FL024);
  });

  it('ignores actions before hydration so saved favorites are never overwritten', async () => {
    const firstLaunch = await hydrated(createFavoritesStore());
    firstLaunch.getState().toggleFavorite(FL004);
    await flushStorage();

    // Next launch, with a slow read: the user taps while AsyncStorage is still being read.
    // Holding the read back lets an early write land first, which is exactly the case that would wipe FL004.
    let releaseRead!: () => void;
    const readGate = new Promise<void>(resolve => (releaseRead = resolve));
    const realGetItem = jest.mocked(AsyncStorage.getItem).getMockImplementation()!;
    jest.mocked(AsyncStorage.getItem).mockImplementationOnce(async key => {
      await readGate;
      return realGetItem(key);
    });

    const secondLaunch = createFavoritesStore();
    expect(secondLaunch.getState().hasHydrated).toBe(false);
    secondLaunch.getState().toggleFavorite(FL013);
    secondLaunch.getState().removeFavorite('FL004');

    // Nothing changed in memory, and nothing was written over the saved favorites.
    expect(favoriteIds(secondLaunch)).toEqual([]);
    expect(await storedFavoriteIds()).toEqual(['FL004']);

    releaseRead();
    await hydrated(secondLaunch);

    expect(favoriteIds(secondLaunch)).toEqual(['FL004']);
    expect(await storedFavoriteIds()).toEqual(['FL004']);
  });

  it('records when each favorite was added, for newest-first ordering', async () => {
    const now = jest.spyOn(Date, 'now');
    const store = await hydrated(createFavoritesStore());

    now.mockReturnValue(1000);
    store.getState().toggleFavorite(FL004);
    now.mockReturnValue(2000);
    store.getState().toggleFavorite(FL013);
    now.mockRestore();

    expect(store.getState().favorites.FL004.addedAt).toBe(1000);
    expect(store.getState().favorites.FL013.addedAt).toBe(2000);
  });
});
