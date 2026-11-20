import {
  AtomicBookingOptions,
  cancelOwnBooking,
  createAtomicBooking,
  createPaymentRecord,
  deleteAdminUser,
  deleteBlogPost,
  deleteBookingRecord,
  deleteCategory,
  deleteContactMessage,
  deleteCustomer,
  deleteGalleryItem,
  deleteHoliday,
  deleteOffer,
  deletePackage,
  deleteReview,
  deleteRoom,
  deleteSalonService,
  deleteSocialPost,
  deleteSpaService,
  deleteStaff,
  fetchAdminUsers,
  fetchAuditLogs,
  fetchBlogPosts,
  fetchBookingsForAdmin,
  fetchBookingSlotsByDate,
  fetchBusinessSettings,
  fetchCategories,
  fetchContactMessagesForAdmin,
  fetchCustomersForAdmin,
  fetchGallery,
  fetchHolidays,
  fetchMyBookings,
  fetchOffers,
  fetchPackages,
  fetchPaymentsForAdmin,
  fetchReviews,
  fetchRooms,
  fetchSalonServices,
  fetchSocialPosts,
  fetchSpaServices,
  fetchStaff,
  saveBusinessSettings,
  seedDemoCatalogToFirestore,
  submitContactMessage,
  submitReview,
  subscribeBookingSlotsByDate,
  updateBookingStatusAndAllocation,
  updateContactMessageStatus,
  updatePaymentRecordStatus,
  updateReviewPublish,
  upsertAdminUser,
  upsertBlogPost,
  upsertCategory,
  upsertCustomer,
  upsertGalleryItem,
  upsertHoliday,
  upsertOffer,
  upsertPackage,
  upsertRoom,
  upsertSalonService,
  upsertSocialPost,
  upsertSpaService,
  upsertStaff,
  writeAuditLog,
} from '../../services/firestoreService.ts';
import {
  AdminUserRecord,
  AuditLog,
  BlogPost,
  Booking,
  BookingSlot,
  BusinessSettings,
  ContactMessage,
  CustomerRecord,
  GalleryItem,
  Holiday,
  Offer,
  PaymentMethod,
  PaymentRecord,
  Review,
  SalonService,
  ServiceCategory,
  SocialPost,
  SpaRoom,
  SpaService,
  StaffMember,
  WellnessPackage,
} from '../../types/domain.ts';
import { baseApi } from './baseApi.ts';

function toQueryError(err: unknown) {
  return {
    status: 'CUSTOM_ERROR' as const,
    error: err instanceof Error ? err.message : 'Unexpected operation failure',
  };
}

export interface AvailabilityStaffShift {
  id?: string;
  name?: string;
  shiftStart: string;
  shiftEnd: string;
  breakStart?: string;
  breakEnd?: string;
  workingDays?: string[];
}

export interface AvailabilityRoomCandidate {
  id: string;
  name: string;
  roomType?: string;
  capacity: number;
  supportsCouple: boolean;
}

export interface AvailabilityRequest {
  date: string;
  durationMinutes: number;
  bufferMinutes: number;
  openTime: string;
  closeTime: string;
  staffId?: string;
  roomId?: string;
  isCouple: boolean;
  existingSlots: BookingSlot[];
  staffShift?: AvailabilityStaffShift;
  eligibleStaff?: Array<AvailabilityStaffShift & { id: string; name: string }>;
  eligibleRooms?: AvailabilityRoomCandidate[];
  holiday?: {
    name: string;
    isClosed: boolean;
    specialHours?: string;
  };
}

export interface AvailabilitySlotResult {
  startTime: string;
  endTime: string;
  bufferEndTime?: string;
  available: boolean;
  reason?: string;
  availableStaffIds?: string[];
  availableRoomIds?: string[];
}

export interface AvailabilityResponse {
  date: string;
  closed: boolean;
  closedReason?: string;
  staffUnavailableReason?: string;
  slots: AvailabilitySlotResult[];
}

export interface CheckConflictRequest extends AvailabilityRequest {
  startTime: string;
  endTime: string;
}

export interface CheckConflictResponse {
  conflict: boolean;
  reason?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedRoomId?: string;
  assignedRoomName?: string;
}

export const platformApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Settings
    getBusinessSettings: builder.query<BusinessSettings, void>({
      async queryFn() {
        try {
          return { data: await fetchBusinessSettings() };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Settings'],
    }),
    updateBusinessSettings: builder.mutation<void, BusinessSettings>({
      async queryFn(settings) {
        try {
          await saveBusinessSettings(settings);
          await writeAuditLog({
            actorEmail: '',
            action: 'UPDATE_SETTINGS',
            entityType: 'settings',
            entityId: 'business',
            summary: `Updated business settings for ${settings.businessName}`,
          });
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Settings', 'AuditLogs'],
    }),

    // Categories
    getCategories: builder.query<ServiceCategory[], boolean | void>({
      async queryFn(includeInactive = false) {
        try {
          return { data: await fetchCategories(Boolean(includeInactive)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Categories'],
    }),
    saveCategory: builder.mutation<void, ServiceCategory>({
      async queryFn(cat) {
        try {
          await upsertCategory(cat);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Categories'],
    }),
    removeCategory: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteCategory(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Categories'],
    }),

    // Spa Services
    getSpaServices: builder.query<SpaService[], boolean | void>({
      async queryFn(includeDrafts = false) {
        try {
          return { data: await fetchSpaServices(Boolean(includeDrafts)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['SpaServices'],
    }),
    saveSpaService: builder.mutation<void, SpaService>({
      async queryFn(service) {
        try {
          await upsertSpaService(service);
          await writeAuditLog({
            actorEmail: '',
            action: 'UPSERT_SPA_SERVICE',
            entityType: 'spaServices',
            entityId: service.id,
            summary: `Saved spa service: ${service.name} (NPR ${service.priceNpr})`,
          });
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['SpaServices', 'AuditLogs'],
    }),
    removeSpaService: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteSpaService(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['SpaServices'],
    }),

    // Salon Services
    getSalonServices: builder.query<SalonService[], boolean | void>({
      async queryFn(includeDrafts = false) {
        try {
          return { data: await fetchSalonServices(Boolean(includeDrafts)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['SalonServices'],
    }),
    saveSalonService: builder.mutation<void, SalonService>({
      async queryFn(service) {
        try {
          await upsertSalonService(service);
          await writeAuditLog({
            actorEmail: '',
            action: 'UPSERT_SALON_SERVICE',
            entityType: 'salonServices',
            entityId: service.id,
            summary: `Saved salon service: ${service.name} (NPR ${service.priceNpr})`,
          });
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['SalonServices', 'AuditLogs'],
    }),
    removeSalonService: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteSalonService(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['SalonServices'],
    }),

    // Packages
    getPackages: builder.query<WellnessPackage[], boolean | void>({
      async queryFn(includeDrafts = false) {
        try {
          return { data: await fetchPackages(Boolean(includeDrafts)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Packages'],
    }),
    savePackage: builder.mutation<void, WellnessPackage>({
      async queryFn(pkg) {
        try {
          await upsertPackage(pkg);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Packages'],
    }),
    removePackage: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deletePackage(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Packages'],
    }),

    // Staff & Therapists
    getStaff: builder.query<StaffMember[], boolean | void>({
      async queryFn(includeUnavailable = false) {
        try {
          return { data: await fetchStaff(Boolean(includeUnavailable)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Staff'],
    }),
    saveStaff: builder.mutation<void, StaffMember>({
      async queryFn(member) {
        try {
          await upsertStaff(member);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Staff'],
    }),
    removeStaff: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteStaff(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Staff'],
    }),

    // Rooms & Facilities
    getRooms: builder.query<SpaRoom[], boolean | void>({
      async queryFn(includeInactive = false) {
        try {
          return { data: await fetchRooms(Boolean(includeInactive)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Rooms'],
    }),
    saveRoom: builder.mutation<void, SpaRoom>({
      async queryFn(room) {
        try {
          await upsertRoom(room);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Rooms'],
    }),
    removeRoom: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteRoom(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Rooms'],
    }),

    // Availability & Bookings
    getBookingSlotsByDate: builder.query<BookingSlot[], string>({
      async queryFn(date) {
        try {
          return { data: await fetchBookingSlotsByDate(date) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      async onCacheEntryAdded(date, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        let unsubscribe: (() => void) | undefined;
        try {
          await cacheDataLoaded;
          unsubscribe = subscribeBookingSlotsByDate(
            date,
            (freshSlots) => {
              updateCachedData(() => freshSlots);
            },
            () => {
              // Keep initial snapshot safely if offline / transient listener error
            }
          );
        } catch {
          // cacheEntryRemoved before cacheDataLoaded
        }
        await cacheEntryRemoved;
        if (unsubscribe) unsubscribe();
      },
      providesTags: ['BookingSlots'],
    }),
    checkAvailability: builder.mutation<AvailabilityResponse, AvailabilityRequest>({
      query: (body) => ({
        url: '/availability',
        method: 'POST',
        body,
      }),
    }),
    checkBookingConflict: builder.mutation<CheckConflictResponse, CheckConflictRequest>({
      query: (body) => ({
        url: '/bookings/check-conflict',
        method: 'POST',
        body,
      }),
    }),
    createBooking: builder.mutation<
      Booking,
      Omit<Booking, 'createdAt' | 'updatedAt'> | { booking: Omit<Booking, 'createdAt' | 'updatedAt'>; options?: AtomicBookingOptions }
    >({
      async queryFn(arg) {
        try {
          const isWrapped = 'booking' in arg;
          const booking = isWrapped ? arg.booking : arg;
          const options = isWrapped ? arg.options : undefined;
          const created = await createAtomicBooking(booking, options);
          return { data: created };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Bookings', 'BookingSlots', 'Reports'],
    }),
    getAdminBookings: builder.query<Booking[], void>({
      async queryFn() {
        try {
          return { data: await fetchBookingsForAdmin() };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Bookings'],
    }),
    getMyBookings: builder.query<Booking[], string>({
      async queryFn(uid) {
        try {
          return { data: await fetchMyBookings(uid) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Bookings'],
    }),
    updateAdminBooking: builder.mutation<
      void,
      {
        bookingId: string;
        updates: Partial<
          Pick<
            Booking,
            'status' | 'staffId' | 'staffName' | 'roomId' | 'roomName' | 'date' | 'startTime' | 'endTime' | 'paymentStatus' | 'notes'
          >
        >;
      }
    >({
      async queryFn({ bookingId, updates }) {
        try {
          await updateBookingStatusAndAllocation(bookingId, updates);
          await writeAuditLog({
            actorEmail: '',
            action: 'UPDATE_BOOKING',
            entityType: 'bookings',
            entityId: bookingId,
            summary: `Updated booking ${bookingId}: ${JSON.stringify(updates)}`,
          });
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Bookings', 'BookingSlots', 'Reports', 'AuditLogs'],
    }),
    removeBooking: builder.mutation<void, string>({
      async queryFn(bookingId) {
        try {
          await deleteBookingRecord(bookingId);
          await writeAuditLog({
            actorEmail: '',
            action: 'DELETE_BOOKING',
            entityType: 'bookings',
            entityId: bookingId,
            summary: `Deleted booking record ${bookingId}`,
          });
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Bookings', 'BookingSlots', 'Reports', 'AuditLogs'],
    }),
    cancelMyBooking: builder.mutation<void, string>({
      async queryFn(bookingId) {
        try {
          await cancelOwnBooking(bookingId);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Bookings', 'BookingSlots'],
    }),

    // Payments
    getAdminPayments: builder.query<PaymentRecord[], void>({
      async queryFn() {
        try {
          return { data: await fetchPaymentsForAdmin() };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Payments'],
    }),
    initiateNepalPayment: builder.mutation<
      {
        transactionId: string;
        bookingRef: string;
        method: PaymentMethod;
        amountNpr: number;
        gatewayToken: string;
        checkoutNote: string;
      },
      { bookingRef: string; method: PaymentMethod; amountNpr: number; customerName: string }
    >({
      query: (body) => ({
        url: '/payments/initiate',
        method: 'POST',
        body,
      }),
    }),
    verifyNepalPayment: builder.mutation<
      { verified: boolean; status: string; transactionId: string; verifiedAt?: string },
      {
        transactionId: string;
        bookingRef: string;
        method: 'esewa' | 'khalti' | 'fonepay';
        gatewayToken: string;
        simulateFailure?: boolean;
      }
    >({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
    }),
    savePaymentRecord: builder.mutation<void, Omit<PaymentRecord, 'createdAt'>>({
      async queryFn(record) {
        try {
          await createPaymentRecord(record);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Payments', 'Reports'],
    }),
    updatePaymentStatus: builder.mutation<void, { id: string; status: PaymentRecord['status'] }>({
      async queryFn({ id, status }) {
        try {
          await updatePaymentRecordStatus(id, status);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Payments', 'Reports'],
    }),

    // Customers CRM
    getCustomers: builder.query<CustomerRecord[], void>({
      async queryFn() {
        try {
          return { data: await fetchCustomersForAdmin() };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Customers'],
    }),
    saveCustomer: builder.mutation<void, CustomerRecord>({
      async queryFn(customer) {
        try {
          await upsertCustomer(customer);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Customers'],
    }),
    removeCustomer: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteCustomer(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Customers'],
    }),

    // Gallery, Social, Blog, Offers, Reviews, Holidays
    getGallery: builder.query<GalleryItem[], boolean | void>({
      async queryFn(includeDrafts = false) {
        try {
          return { data: await fetchGallery(Boolean(includeDrafts)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Gallery'],
    }),
    saveGalleryItem: builder.mutation<void, GalleryItem>({
      async queryFn(item) {
        try {
          await upsertGalleryItem(item);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Gallery'],
    }),
    removeGalleryItem: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteGalleryItem(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Gallery'],
    }),

    getSocialPosts: builder.query<SocialPost[], boolean | void>({
      async queryFn(includeDrafts = false) {
        try {
          return { data: await fetchSocialPosts(Boolean(includeDrafts)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['SocialPosts'],
    }),
    saveSocialPost: builder.mutation<void, SocialPost>({
      async queryFn(post) {
        try {
          await upsertSocialPost(post);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['SocialPosts'],
    }),
    removeSocialPost: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteSocialPost(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['SocialPosts'],
    }),

    getBlogPosts: builder.query<BlogPost[], boolean | void>({
      async queryFn(includeDrafts = false) {
        try {
          return { data: await fetchBlogPosts(Boolean(includeDrafts)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['BlogPosts'],
    }),
    saveBlogPost: builder.mutation<void, BlogPost>({
      async queryFn(post) {
        try {
          await upsertBlogPost(post);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['BlogPosts'],
    }),
    removeBlogPost: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteBlogPost(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['BlogPosts'],
    }),

    getOffers: builder.query<Offer[], boolean | void>({
      async queryFn(includeInactive = false) {
        try {
          return { data: await fetchOffers(Boolean(includeInactive)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Offers'],
    }),
    saveOffer: builder.mutation<void, Offer>({
      async queryFn(offer) {
        try {
          await upsertOffer(offer);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Offers'],
    }),
    removeOffer: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteOffer(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Offers'],
    }),

    getReviews: builder.query<Review[], boolean | void>({
      async queryFn(includePending = false) {
        try {
          return { data: await fetchReviews(Boolean(includePending)) };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Reviews'],
    }),
    createReview: builder.mutation<void, Omit<Review, 'createdAt'>>({
      async queryFn(review) {
        try {
          await submitReview(review);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Reviews'],
    }),
    moderateReview: builder.mutation<void, { id: string; published: boolean }>({
      async queryFn({ id, published }) {
        try {
          await updateReviewPublish(id, published);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Reviews'],
    }),
    removeReview: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteReview(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Reviews'],
    }),

    getHolidays: builder.query<Holiday[], void>({
      async queryFn() {
        try {
          return { data: await fetchHolidays() };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Holidays'],
    }),
    saveHoliday: builder.mutation<void, Holiday>({
      async queryFn(holiday) {
        try {
          await upsertHoliday(holiday);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Holidays'],
    }),
    removeHoliday: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteHoliday(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Holidays'],
    }),

    // Contact, Notifications, Admins, Audit Logs, Seed
    sendContactMessage: builder.mutation<void, Omit<ContactMessage, 'createdAt' | 'status'>>({
      async queryFn(msg) {
        try {
          await submitContactMessage(msg);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['ContactMessages'],
    }),
    getContactMessages: builder.query<ContactMessage[], void>({
      async queryFn() {
        try {
          return { data: await fetchContactMessagesForAdmin() };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['ContactMessages'],
    }),
    updateContactMessageStatus: builder.mutation<void, { id: string; status: ContactMessage['status'] }>({
      async queryFn({ id, status }) {
        try {
          await updateContactMessageStatus(id, status);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['ContactMessages'],
    }),
    removeContactMessage: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteContactMessage(id);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['ContactMessages'],
    }),
    composeNotification: builder.mutation<
      {
        whatsappUrl: string;
        smsPayload: { to: string; senderId: string; body: string };
        emailPayload: { to: string; subject: string; body: string } | null;
      },
      {
        bookingRef: string;
        customerName: string;
        customerPhone: string;
        customerEmail?: string;
        date: string;
        startTime: string;
        serviceNames: string[];
        totalNpr: number;
        language: 'en' | 'ne';
        whatsappBusinessNumber?: string;
      }
    >({
      query: (body) => ({
        url: '/notifications/compose',
        method: 'POST',
        body,
      }),
    }),
    getAdminUsers: builder.query<AdminUserRecord[], void>({
      async queryFn() {
        try {
          return { data: await fetchAdminUsers() };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['Admins'],
    }),
    saveAdminUser: builder.mutation<void, AdminUserRecord>({
      async queryFn(record) {
        try {
          await upsertAdminUser(record);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Admins'],
    }),
    removeAdminUser: builder.mutation<void, string>({
      async queryFn(uid) {
        try {
          await deleteAdminUser(uid);
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: ['Admins'],
    }),
    getAuditLogs: builder.query<AuditLog[], void>({
      async queryFn() {
        try {
          return { data: await fetchAuditLogs() };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      providesTags: ['AuditLogs'],
    }),
    seedCatalog: builder.mutation<void, void>({
      async queryFn() {
        try {
          await seedDemoCatalogToFirestore();
          return { data: undefined };
        } catch (e) {
          return { error: toQueryError(e) };
        }
      },
      invalidatesTags: [
        'SpaServices',
        'SalonServices',
        'Categories',
        'Packages',
        'Staff',
        'Rooms',
        'Bookings',
        'BookingSlots',
        'Customers',
        'Payments',
        'ContactMessages',
        'Gallery',
        'SocialPosts',
        'BlogPosts',
        'Offers',
        'Reviews',
        'Holidays',
        'Settings',
        'AuditLogs',
        'Reports',
      ],
    }),
  }),
});

export const {
  useGetBusinessSettingsQuery,
  useUpdateBusinessSettingsMutation,
  useGetCategoriesQuery,
  useSaveCategoryMutation,
  useRemoveCategoryMutation,
  useGetSpaServicesQuery,
  useSaveSpaServiceMutation,
  useRemoveSpaServiceMutation,
  useGetSalonServicesQuery,
  useSaveSalonServiceMutation,
  useRemoveSalonServiceMutation,
  useGetPackagesQuery,
  useSavePackageMutation,
  useRemovePackageMutation,
  useGetStaffQuery,
  useSaveStaffMutation,
  useRemoveStaffMutation,
  useGetRoomsQuery,
  useSaveRoomMutation,
  useRemoveRoomMutation,
  useGetBookingSlotsByDateQuery,
  useCheckAvailabilityMutation,
  useCheckBookingConflictMutation,
  useCreateBookingMutation,
  useGetAdminBookingsQuery,
  useGetMyBookingsQuery,
  useUpdateAdminBookingMutation,
  useRemoveBookingMutation,
  useCancelMyBookingMutation,
  useGetAdminPaymentsQuery,
  useInitiateNepalPaymentMutation,
  useVerifyNepalPaymentMutation,
  useSavePaymentRecordMutation,
  useUpdatePaymentStatusMutation,
  useGetCustomersQuery,
  useSaveCustomerMutation,
  useRemoveCustomerMutation,
  useGetGalleryQuery,
  useSaveGalleryItemMutation,
  useRemoveGalleryItemMutation,
  useGetSocialPostsQuery,
  useSaveSocialPostMutation,
  useRemoveSocialPostMutation,
  useGetBlogPostsQuery,
  useSaveBlogPostMutation,
  useRemoveBlogPostMutation,
  useGetOffersQuery,
  useSaveOfferMutation,
  useRemoveOfferMutation,
  useGetReviewsQuery,
  useCreateReviewMutation,
  useModerateReviewMutation,
  useRemoveReviewMutation,
  useGetHolidaysQuery,
  useSaveHolidayMutation,
  useRemoveHolidayMutation,
  useSendContactMessageMutation,
  useGetContactMessagesQuery,
  useUpdateContactMessageStatusMutation,
  useRemoveContactMessageMutation,
  useComposeNotificationMutation,
  useGetAdminUsersQuery,
  useSaveAdminUserMutation,
  useRemoveAdminUserMutation,
  useGetAuditLogsQuery,
  useSeedCatalogMutation,
} = platformApi;
