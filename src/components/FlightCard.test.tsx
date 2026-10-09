import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { favoritesStore } from '../features/favorites/favoritesStore';
import { makeFlight } from '../test/fixtures';
import { FlightCard } from './FlightCard';

const FL004 = makeFlight({ id: 'FL004', flightNumber: 'AE331', airline: 'Anadolu Express' });

describe('FlightCard', () => {
  it('toggles the favorite without opening the detail', async () => {
    const onPress = jest.fn();
    await render(<FlightCard flight={FL004} onPress={onPress} />);

    const addButton = screen.getByRole('button', { name: 'AE331 favorilere ekle' });
    // Disabled until the saved favorites are read from storage.
    await waitFor(() => expect(addButton).toBeEnabled());

    await fireEvent.press(addButton);

    expect(onPress).not.toHaveBeenCalled();
    expect('FL004' in favoritesStore.getState().favorites).toBe(true);
    expect(screen.getByRole('button', { name: 'AE331 favorilerden çıkar' })).toBeSelected();
    expect(screen.getByText('Favoride')).toBeOnTheScreen();
  });

  it('opens the detail when the card itself is pressed', async () => {
    const onPress = jest.fn();
    await render(<FlightCard flight={FL004} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: /^Anadolu Express AE331/ }));

    expect(onPress).toHaveBeenCalledWith(FL004);
  });
});
