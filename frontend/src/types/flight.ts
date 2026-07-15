export interface Airport {
  id: string;
  code: string; // e.g. SGN, HAN, DAD
  name: string; // e.g. Tân Sơn Nhất, Nội Bài
  city: string; // e.g. Hồ Chí Minh, Hà Nội
  country: string; // e.g. Việt Nam
}

export interface FlightLeg {
  id: string;
  flightNumber: string;
  airline: string;
  airlineLogo: string;
  aircraftType: string; // e.g. Airbus A321
  departureAirportCode: string;
  arrivalAirportCode: string;
  departureTime: string; // ISO string
  arrivalTime: string; // ISO string
  durationMinutes: number;
}

export interface FareClassPricing {
  class: 'Economy' | 'Premium Economy' | 'Business' | 'First Class';
  price: number;
  availableSeats: number;
  baggageAllowance: number; // kg
  cabinBaggage: number; // kg
  hasMeal: boolean;
  freeCancellation: boolean;
  freeReschedule: boolean;
}

export interface Flight {
  id: string;
  legs: FlightLeg[]; // For direct flights, length is 1. For transits, length > 1
  totalDurationMinutes: number;
  departureAirportCode: string;
  arrivalAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  pricing: FareClassPricing[];
}
