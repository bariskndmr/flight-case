/**
 * Display formatting for flight data. Pure functions, no Intl:
 * the output must not depend on the device locale or time zone (tests run under TZ=America/New_York).
 */

/** Groups the integer part with dots: 1234567 -> "1.234.567". */
function groupThousands(value: number): string {
  const digits = String(value);
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= 3) {
    groups.unshift(digits.slice(Math.max(0, end - 3), end));
  }
  return groups.join('.');
}

/**
 * `priceMinor` is an integer amount of kuruş. Integer division keeps it exact (no floating point),
 * and we spell out "TL" ourselves because Intl's TRY currency format renders "₺".
 * 355000 -> "3.550,00 TL"
 */
export function formatPrice(priceMinor: number): string {
  const lira = Math.floor(priceMinor / 100);
  const kurus = priceMinor % 100;
  return `${groupThousands(lira)},${String(kurus).padStart(2, '0')} TL`;
}

/** 75 -> "1 sa 15 dk", 240 -> "4 sa", 45 -> "45 dk" */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} dk`;
  if (minutes === 0) return `${hours} sa`;
  return `${hours} sa ${minutes} dk`;
}

/** 0 and null mean different things and must read differently; never use a falsy check here. */
export function baggageText(baggageKg: number | null): string {
  if (baggageKg === null) return 'Bagaj bilgisi yok';
  if (baggageKg === 0) return 'Bagaj dahil değil';
  return `${baggageKg} kg`;
}

export function stopsText(stops: number): string {
  return stops === 0 ? 'Direkt' : `${stops} aktarma`;
}

/*
 * Istanbul time.
 * Türkiye has stayed on UTC+3 all year since 2016 (no daylight saving), so a fixed offset is exact.
 * We shift the instant by +3 h and read the UTC fields, which ignores the device time zone entirely.
 */
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;

const MONTHS_TR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

function toIstanbulClock(iso: string): Date {
  return new Date(Date.parse(iso) + ISTANBUL_OFFSET_MS);
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** "2026-10-15T13:25:00+03:00" -> "13:25" (Istanbul) */
export function formatTime(iso: string): string {
  const clock = toIstanbulClock(iso);
  return `${pad2(clock.getUTCHours())}:${pad2(clock.getUTCMinutes())}`;
}

/** "2026-10-15T13:25:00+03:00" -> "15 Ekim 2026" (Istanbul) */
export function formatDate(iso: string): string {
  const clock = toIstanbulClock(iso);
  return `${clock.getUTCDate()} ${MONTHS_TR[clock.getUTCMonth()]} ${clock.getUTCFullYear()}`;
}

/** True when the arrival falls on a later Istanbul calendar day than the departure (FL024). */
export function isNextDay(departureIso: string, arrivalIso: string): boolean {
  const istanbulDay = (iso: string) => toIstanbulClock(iso).toISOString().slice(0, 10);
  return istanbulDay(arrivalIso) > istanbulDay(departureIso);
}
