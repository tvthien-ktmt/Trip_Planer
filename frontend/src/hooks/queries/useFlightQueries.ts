import { useQuery } from '@tanstack/react-query';
import { mockAirports } from '../../mocks/data/airports.mock';
import { mockFlights } from '../../mocks/data/flights.mock';

// Fetch Airports
export const useAirportsQuery = () => {
  return useQuery({
    queryKey: ['airports'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAirports;
    }
  });
};

// Search Flights
export interface FlightSearchParams {
  departureAirportCode?: string;
  arrivalAirportCode?: string;
  departureDate?: string;
}

export const useSearchFlightsQuery = (params: FlightSearchParams) => {
  return useQuery({
    queryKey: ['flights', params],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let results = mockFlights;
      
      if (params.departureAirportCode) {
        results = results.filter(f => f.departureAirportCode === params.departureAirportCode);
      }
      
      if (params.arrivalAirportCode) {
        results = results.filter(f => f.arrivalAirportCode === params.arrivalAirportCode);
      }
      
      // Simple date matching (ignoring time)
      if (params.departureDate) {
        const searchDate = new Date(params.departureDate).toISOString().split('T')[0];
        results = results.filter(f => {
          const flightDate = new Date(f.departureTime).toISOString().split('T')[0];
          return flightDate === searchDate;
        });
      }
      
      return results;
    },
    enabled: !!params.departureAirportCode && !!params.arrivalAirportCode,
  });
};
