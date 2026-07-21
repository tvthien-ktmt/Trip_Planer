import axios from 'axios';
import { PassengerInfo, BookingPax } from '../types';
import { useAuthStore } from '../stores/authStore';

// Create API instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for auth token
api.interceptors.request.use((config) => {
  let token = useAuthStore.getState().token;
  // removed getAuthCookie fallback
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// FE-005: Fix infinite loop 401 retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data?.access_token;
        if (newToken) {
          useAuthStore.setState({ token: newToken });
        }
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Basic Booking API Wrapper
export const bookingApi = {
  createDraftBooking: (data: { type: 'FLIGHT' | 'TOUR' }) => api.post('/bookings', data),
  selectSeat: (id: string, seatData: { passengerId: string; seatId: string; version: number }) => api.patch(`/bookings/${id}/seats`, seatData),
  addPassengers: (id: string, passengers: { passengers: PassengerInfo[] }) => api.put(`/bookings/${id}/passengers`, passengers),
  addAddons: (id: string, addons: string[]) => api.post(`/bookings/${id}/addons`, { addons }),
  applyVoucher: (id: string, code: string) => api.post(`/bookings/${id}/apply-voucher`, { code }),
  updateStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }),
};

export const paymentApi = {
  initiatePayment: (bookingId: string) => api.post(`/payments/${bookingId}/initiate`),
  initiateSepay: (bookingId: string) => api.post(`/payments/${bookingId}/initiate-sepay`),
  getPaymentStatus: (paymentId: string) => api.get(`/payments/status/${paymentId}`),
};
