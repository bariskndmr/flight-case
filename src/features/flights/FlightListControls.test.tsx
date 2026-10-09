import { fireEvent, render, screen } from '@testing-library/react-native';
import { DEFAULT_FILTERS } from '../../api/flights';
import { FlightListControls } from './FlightListControls';

describe('FlightListControls', () => {
  it('exposes the filter by name and the selected sort by state and a visible mark', async () => {
    await render(<FlightListControls filters={DEFAULT_FILTERS} total={24} onChange={jest.fn()} />);

    expect(screen.getByRole('switch', { name: 'Yalnızca direkt uçuşlar' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'En düşük fiyat' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'En kısa süre' })).not.toBeSelected();
    // Not by color alone: the selected option also carries a check mark.
    expect(screen.getByText('✓ En düşük fiyat')).toBeOnTheScreen();
    expect(screen.getByText('24 uçuş')).toBeOnTheScreen();
  });

  it('reports the new sort and filter values', async () => {
    const onChange = jest.fn();
    await render(<FlightListControls filters={DEFAULT_FILTERS} total={24} onChange={onChange} />);

    await fireEvent.press(screen.getByRole('button', { name: 'En kısa süre' }));
    expect(onChange).toHaveBeenLastCalledWith({ sort: 'duration', onlyDirect: false });

    await fireEvent(screen.getByRole('switch', { name: 'Yalnızca direkt uçuşlar' }), 'valueChange', true);
    expect(onChange).toHaveBeenLastCalledWith({ sort: 'price', onlyDirect: true });
  });
});
