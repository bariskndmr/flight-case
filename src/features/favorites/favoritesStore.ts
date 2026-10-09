import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import type { FlightDto } from '../../api/flight.types';

export type FavoriteEntry = {
  /** The whole flight is stored, so the favorites screen and detail work without a request. */
  flight: FlightDto;
  /** Used to list the most recently added favorite first. */
  addedAt: number;
};

export type FavoritesState = {
  /** Flight id -> entry. The single source of truth for "is this flight a favorite?". */
  favorites: Record<string, FavoriteEntry>;
  /**
   * False until the saved favorites have been read from AsyncStorage.
   * Any write before that would persist an empty map over the saved one, so actions are no-ops until then.
   */
  hasHydrated: boolean;
  toggleFavorite: (flight: FlightDto) => void;
  markHydrated: () => void;
};

export const FAVORITES_STORAGE_KEY = 'favorites';

/** A factory so tests can build a fresh store and simulate an app restart against the same storage. */
export function createFavoritesStore() {
  return createStore<FavoritesState>()(
    persist(
      (set, get) => ({
        favorites: {},
        hasHydrated: false,

        toggleFavorite: flight => {
          if (!get().hasHydrated) return;
          const { [flight.id]: existing, ...rest } = get().favorites;
          set({
            favorites: existing ? rest : { ...get().favorites, [flight.id]: { flight, addedAt: Date.now() } },
          });
        },

        markHydrated: () => set({ hasHydrated: true }),
      }),
      {
        name: FAVORITES_STORAGE_KEY,
        version: 1,
        storage: createJSONStorage(() => AsyncStorage),
        // Only favorites are saved; hasHydrated must start as false on every launch.
        partialize: state => ({ favorites: state.favorites }),
        // Runs after the read finishes, successfully or not. On failure we still unlock the actions,
        // otherwise favorites would stay disabled for the whole session.
        onRehydrateStorage: initialState => (_state, error) => {
          if (error && __DEV__) console.log('[favorites] could not restore favorites', error);
          initialState.markHydrated();
        },
      },
    ),
  );
}

export type FavoritesStore = ReturnType<typeof createFavoritesStore>;

/** The app-wide instance. */
export const favoritesStore = createFavoritesStore();

export function useFavorites<T>(selector: (state: FavoritesState) => T): T {
  return useStore(favoritesStore, selector);
}

/** Selector for one flight: a card re-renders only when its own favorite state changes. */
export const selectIsFavorite = (id: string) => (state: FavoritesState) => id in state.favorites;

/**
 * Favorites screen order: most recently added first.
 * A plain function to call inside useMemo, not a selector: a selector that builds a new array
 * on every call makes Zustand's useSyncExternalStore re-render forever.
 */
export function favoritesNewestFirst(favorites: Record<string, FavoriteEntry>): FlightDto[] {
  return Object.values(favorites)
    .sort((a, b) => b.addedAt - a.addedAt)
    .map(entry => entry.flight);
}
