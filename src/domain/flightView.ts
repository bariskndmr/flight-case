import type { FlightDto } from '../api/flight.types';
import { baggageText, formatDate, formatDuration, formatPrice, formatTime, isNextDay, stopsText } from './format';

/**
 * What the screens render. State keeps the raw DTO; this is derived at render time,
 * so sorting/filtering never sees formatted text and there is a single place that formats.
 */
export type FlightView = {
  id: string;
  flightNumber: string;
  airline: string;
  /** "Anadolu Express · AE331" */
  title: string;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  arrivesNextDay: boolean;
  duration: string;
  stops: string;
  price: string;
  baggage: string;
  /** One sentence VoiceOver reads for the whole card. */
  accessibilitySummary: string;
};

export function toFlightView(flight: FlightDto): FlightView {
  const departureTime = formatTime(flight.departureAt);
  const arrivalTime = formatTime(flight.arrivalAt);
  const arrivesNextDay = isNextDay(flight.departureAt, flight.arrivalAt);
  const duration = formatDuration(flight.durationMinutes);
  const stops = stopsText(flight.stops);
  const price = formatPrice(flight.priceMinor);

  const arrivalSpoken = arrivesNextDay ? `${arrivalTime}, ertesi gün` : arrivalTime;

  return {
    id: flight.id,
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    title: `${flight.airline} · ${flight.flightNumber}`,
    originCode: flight.origin.code,
    originName: flight.origin.name,
    destinationCode: flight.destination.code,
    destinationName: flight.destination.name,
    departureTime,
    arrivalTime,
    departureDate: formatDate(flight.departureAt),
    arrivalDate: formatDate(flight.arrivalAt),
    arrivesNextDay,
    duration,
    stops,
    price,
    baggage: baggageText(flight.baggageKg),
    accessibilitySummary:
      `${flight.airline} ${flight.flightNumber}, ` +
      `${flight.origin.code} ${departureTime} – ${flight.destination.code} ${arrivalSpoken}, ` +
      `${duration}, ${stops}, ${price}`,
  };
}
