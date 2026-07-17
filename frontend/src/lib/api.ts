import axios from 'axios';
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
  const token = useAuthStore.getState().token;
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
        await axios.post('http://localhost:3000/api/auth/refresh', {}, { withCredentials: true });
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
  createDraftBooking: (data: any) => api.post('/booking', data),
  selectSeat: (id: string, seatData: any) => api.post(`/booking/${id}/seats`, seatData),
  addPassengers: (id: string, passengers: any) => api.post(`/booking/${id}/passengers`, passengers),
  applyVoucher: (id: string, code: string) => api.post(`/booking/${id}/voucher`, { code }),
  updateStatus: (id: string, status: string) => api.patch(`/booking/${id}/status`, { status }),
};
