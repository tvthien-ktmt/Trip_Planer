import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

// Fetch Airports
export const useAirportsQuery = () => {
  return useQuery({
    queryKey: ['airports'],
    queryFn: async (): Promise<any[]> => {
      const { data } = await api.get('/flights/airports');
      return data.data || data;
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
    queryFn: async (): Promise<any[]> => {
      const { data } = await api.get('/flights/search', { params });
      return data.data || data;
    },
    enabled: !!params.departureAirportCode && !!params.arrivalAirportCode,
  });
};

export const useFlightDetailQuery = (id: string | number) => {
  return useQuery({
    queryKey: ['flight', id],
    queryFn: async () => {
      const { data } = await api.get(`/flights/${id}`);
      return data.data || data;
    },
    enabled: !!id,
  });
};
