import { makeFlight } from '../test/fixtures';
import { toFlightView } from './flightView';

// FL024 from case-kit/flights.json: departs 23:20, lands 00:45 the next day.
const FL024 = makeFlight({
  id: 'FL024',
  flightNumber: 'AE383',
  airline: 'Anadolu Express',
  origin: { code: 'SAW', city: 'İstanbul', name: 'Sabiha Gökçen Havalimanı' },
  departureAt: '2026-10-15T23:20:00+03:00',
  arrivalAt: '2026-10-16T00:45:00+03:00',
  durationMinutes: 85,
  stops: 0,
  priceMinor: 152000,
  baggageKg: 0,
});

describe('toFlightView', () => {
  it('formats every field of a same-day flight', () => {
    expect(toFlightView(makeFlight())).toMatchObject({
      flightNumber: 'TA544',
      originCode: 'IST',
      destinationCode: 'AYT',
      departureTime: '13:25',
      arrivalTime: '14:35',
      departureDate: '15 Ekim 2026',
      arrivalDate: '15 Ekim 2026',
      arrivesNextDay: false,
      duration: '1 sa 10 dk',
      stops: 'Direkt',
      price: '3.550,00 TL',
      baggage: '20 kg',
    });
  });

  it('marks FL024 as arriving the next day, with separate dates', () => {
    const view = toFlightView(FL024);

    expect(view).toMatchObject({
      departureTime: '23:20',
      arrivalTime: '00:45',
      departureDate: '15 Ekim 2026',
      arrivalDate: '16 Ekim 2026',
      arrivesNextDay: true,
      baggage: 'Bagaj dahil değil',
    });
    expect(view.accessibilitySummary).toContain('00:45, ertesi gün');
  });

  it('shows missing baggage information differently from no baggage', () => {
    expect(toFlightView(makeFlight({ baggageKg: null })).baggage).toBe('Bagaj bilgisi yok');
    expect(toFlightView(makeFlight({ baggageKg: 0 })).baggage).toBe('Bagaj dahil değil');
  });

  it('summarises the card in one sentence for VoiceOver', () => {
    expect(toFlightView(makeFlight({ stops: 1, durationMinutes: 210 })).accessibilitySummary).toBe(
      'Toros Air TA544, IST 13:25 – AYT 14:35, 3 sa 30 dk, 1 aktarma, 3.550,00 TL',
    );
  });
});
