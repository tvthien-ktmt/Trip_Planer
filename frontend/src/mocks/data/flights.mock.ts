import type { Flight } from '../../types/flight';

// Generate some flights between SGN and HAN for testing
export const mockFlights: Flight[] = [
  {
    id: 'fl-1',
    departureAirportCode: 'SGN',
    arrivalAirportCode: 'HAN',
    departureTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(10, 10, 0, 0)).toISOString(),
    totalDurationMinutes: 130,
    legs: [
      {
        id: 'leg-1',
        flightNumber: 'VN208',
        airline: 'Vietnam Airlines',
        airlineLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=150&auto=format&fit=crop',
        aircraftType: 'Airbus A350',
        departureAirportCode: 'SGN',
        arrivalAirportCode: 'HAN',
        departureTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
        arrivalTime: new Date(new Date().setHours(10, 10, 0, 0)).toISOString(),
        durationMinutes: 130,
      }
    ],
    pricing: [
      {
        class: 'Economy',
        price: 1500000,
        availableSeats: 45,
        baggageAllowance: 23,
        cabinBaggage: 10,
        hasMeal: true,
        freeCancellation: false,
        freeReschedule: true,
      },
      {
        class: 'Business',
        price: 4500000,
        availableSeats: 12,
        baggageAllowance: 32,
        cabinBaggage: 12,
        hasMeal: true,
        freeCancellation: true,
        freeReschedule: true,
      }
    ]
  },
  {
    id: 'fl-2',
    departureAirportCode: 'SGN',
    arrivalAirportCode: 'HAN',
    departureTime: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date().setHours(14, 40, 0, 0)).toISOString(),
    totalDurationMinutes: 130,
    legs: [
      {
        id: 'leg-2',
        flightNumber: 'VJ124',
        airline: 'Vietjet Air',
        airlineLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=150&auto=format&fit=crop',
        aircraftType: 'Airbus A321',
        departureAirportCode: 'SGN',
        arrivalAirportCode: 'HAN',
        departureTime: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
        arrivalTime: new Date(new Date().setHours(14, 40, 0, 0)).toISOString(),
        durationMinutes: 130,
      }
    ],
    pricing: [
      {
        class: 'Economy',
        price: 890000,
        availableSeats: 60,
        baggageAllowance: 0,
        cabinBaggage: 7,
        hasMeal: false,
        freeCancellation: false,
        freeReschedule: false,
      }
    ]
  },
  {
    id: 'fl-3',
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'NRT',
    departureTime: new Date(new Date().setHours(23, 50, 0, 0)).toISOString(),
    arrivalTime: new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(7, 0, 0, 0)).toISOString(),
    totalDurationMinutes: 310,
    legs: [
      {
        id: 'leg-3',
        flightNumber: 'VN310',
        airline: 'Vietnam Airlines',
        airlineLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=150&auto=format&fit=crop',
        aircraftType: 'Boeing 787',
        departureAirportCode: 'HAN',
        arrivalAirportCode: 'NRT',
        departureTime: new Date(new Date().setHours(23, 50, 0, 0)).toISOString(),
        arrivalTime: new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(7, 0, 0, 0)).toISOString(),
        durationMinutes: 310,
      }
    ],
    pricing: [
      {
        class: 'Economy',
        price: 6500000,
        availableSeats: 120,
        baggageAllowance: 46,
        cabinBaggage: 12,
        hasMeal: true,
        freeCancellation: false,
        freeReschedule: true,
      }
    ]
  }
];
