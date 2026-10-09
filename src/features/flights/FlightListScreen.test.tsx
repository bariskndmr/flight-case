import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '../../../App';
import { ApiError } from '../../api/client';
import { getFlights } from '../../api/flights';
import { makeFlight, makePage } from '../../test/fixtures';

jest.mock('../../api/flights', () => ({
  ...jest.requireActual('../../api/flights'),
  getFlights: jest.fn(),
}));

const getFlightsMock = jest.mocked(getFlights);

beforeEach(() => {
  getFlightsMock.mockReset();
});

describe('Flight list screen', () => {
  it('shows an error with "Tekrar dene" and recovers to the list after retrying', async () => {
    const page = makePage(['FL004', 'FL009'], { total: 2 });
    page.items[0] = makeFlight({ id: 'FL004', flightNumber: 'AE331', airline: 'Anadolu Express' });
    getFlightsMock
      .mockRejectedValueOnce(new ApiError(500, 'FLIGHTS_UNAVAILABLE', 'Uçuşlar yüklenemedi.'))
      .mockResolvedValueOnce(page);

    await render(<App />);

    expect(await screen.findByText('Uçuşlar yüklenemedi.')).toBeOnTheScreen();
    expect(screen.queryByText('Uçuş bulunamadı.')).not.toBeOnTheScreen();
    expect(screen.queryByLabelText('Yükleniyor')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Tekrar dene' }));

    expect(await screen.findByText('2 uçuş')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /^Anadolu Express AE331/ })).toBeOnTheScreen();
    expect(screen.queryByText('Uçuşlar yüklenemedi.')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tekrar dene' })).not.toBeOnTheScreen();

    // Retrying asks for the same first page again, with the same filters.
    expect(getFlightsMock.mock.calls.map(([params]) => params)).toEqual([
      { page: 1, sort: 'price', onlyDirect: false },
      { page: 1, sort: 'price', onlyDirect: false },
    ]);
  });
});
