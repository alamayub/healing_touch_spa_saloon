import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { auth } from '../../lib/firebase.ts';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: async (headers) => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          headers.set('Authorization', `Bearer ${token}`);
        } catch {
          // Ignore token retrieval error on public endpoints
        }
      }
      return headers;
    },
  }),
  tagTypes: [
    'SpaServices',
    'SalonServices',
    'Categories',
    'Packages',
    'Bookings',
    'BookingSlots',
    'Staff',
    'Rooms',
    'Customers',
    'Gallery',
    'SocialPosts',
    'BlogPosts',
    'Offers',
    'Reviews',
    'Holidays',
    'Payments',
    'Settings',
    'Admins',
    'AuditLogs',
    'ContactMessages',
    'Reports',
  ],
  endpoints: () => ({}),
});
