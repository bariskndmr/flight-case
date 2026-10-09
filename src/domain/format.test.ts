import { baggageText, formatDate, formatDuration, formatPrice, formatTime, isNextDay, stopsText } from './format';

describe('formatPrice', () => {
  it.each([
    [355000, '3.550,00 TL'],
    [119900, '1.199,00 TL'],
    [99950, '999,50 TL'],
    [5, '0,05 TL'],
    [123456789, '1.234.567,89 TL'],
  ])('%i kuruş -> %s', (priceMinor, expected) => {
    expect(formatPrice(priceMinor)).toBe(expected);
  });

  it('spells out TL instead of the ₺ sign', () => {
    expect(formatPrice(355000)).not.toContain('₺');
  });
});

describe('baggageText', () => {
  it('says baggage is not included for 0', () => {
    expect(baggageText(0)).toBe('Bagaj dahil değil');
  });

  it('says there is no information for null', () => {
    expect(baggageText(null)).toBe('Bagaj bilgisi yok');
  });

  it('shows the allowance in kg otherwise', () => {
    expect(baggageText(20)).toBe('20 kg');
    expect(baggageText(15)).toBe('15 kg');
  });
});

describe('formatDuration', () => {
  it.each([
    [75, '1 sa 15 dk'],
    [65, '1 sa 5 dk'],
    [240, '4 sa'],
    [45, '45 dk'],
    [330, '5 sa 30 dk'],
  ])('%i min -> %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});

describe('stopsText', () => {
  it('labels direct and connecting flights', () => {
    expect(stopsText(0)).toBe('Direkt');
    expect(stopsText(1)).toBe('1 aktarma');
  });
});

describe('Istanbul time', () => {
  it('runs these tests in a non-Istanbul time zone, so a device-time bug would show', () => {
    // 2026-10-15T13:25+03:00 is 06:25 in New York; if formatting used the device zone we would see 06:25.
    expect(new Date('2026-10-15T13:25:00+03:00').getHours()).toBe(6);
  });

  it('formats times in Istanbul regardless of the device time zone', () => {
    expect(formatTime('2026-10-15T13:25:00+03:00')).toBe('13:25');
    expect(formatTime('2026-10-15T07:30:00+03:00')).toBe('07:30');
    expect(formatTime('2026-10-16T00:45:00+03:00')).toBe('00:45');
  });

  it('converts an instant given in another offset to Istanbul time', () => {
    expect(formatTime('2026-10-15T10:25:00Z')).toBe('13:25');
  });

  it('formats dates in Turkish, on the Istanbul calendar day', () => {
    expect(formatDate('2026-10-15T23:20:00+03:00')).toBe('15 Ekim 2026');
    expect(formatDate('2026-10-16T00:45:00+03:00')).toBe('16 Ekim 2026');
  });
});

describe('isNextDay', () => {
  it('is true for FL024, which lands after midnight', () => {
    expect(isNextDay('2026-10-15T23:20:00+03:00', '2026-10-16T00:45:00+03:00')).toBe(true);
  });

  it('is false for a same-day arrival', () => {
    expect(isNextDay('2026-10-15T13:25:00+03:00', '2026-10-15T14:35:00+03:00')).toBe(false);
  });

  it('is false for a late flight that lands before midnight in Istanbul', () => {
    // 23:50 Istanbul is still 15 Oct there, but already 16 Oct in UTC: compare on the Istanbul calendar.
    expect(isNextDay('2026-10-15T22:00:00+03:00', '2026-10-15T23:50:00+03:00')).toBe(false);
  });
});
