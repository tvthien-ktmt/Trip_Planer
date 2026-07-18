export const routes = {
  tourDetail: (id: string) => `/tours/${id}`,
  flightDetail: (id: string) => `/flights/${id}`,
  bookingTicket: (id: string) => `/booking/${id}/ticket`,
  blogDetail: (slug: string) => `/blog/${slug}`,
  userBookingDetail: (id: string) => `/user/bookings/${id}`,
  adminBookingDetail: (id: string) => `/admin/bookings/${id}`,
} as const;
