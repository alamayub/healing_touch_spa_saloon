import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  DEFAULT_BUSINESS_SETTINGS,
  DEMO_BLOG_POSTS,
  DEMO_CATEGORIES,
  DEMO_GALLERY,
  DEMO_HOLIDAYS,
  DEMO_OFFERS,
  DEMO_PACKAGES,
  DEMO_REVIEWS,
  DEMO_ROOMS,
  DEMO_SALON_SERVICES,
  DEMO_SOCIAL_POSTS,
  DEMO_SPA_SERVICES,
  DEMO_STAFF,
} from '../data/demoCatalog.ts';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import {
  AdminUserRecord,
  AuditLog,
  BlogPost,
  Booking,
  BookingSlot,
  BookingStatus,
  BusinessSettings,
  ContactMessage,
  CustomerRecord,
  GalleryItem,
  Holiday,
  Offer,
  PaymentRecord,
  Review,
  SalonService,
  ServiceCategory,
  SocialPost,
  SpaRoom,
  SpaService,
  StaffMember,
  WellnessPackage,
} from '../types/domain.ts';

function normalizeTimestamp(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

export async function fetchSpaServices(includeDrafts = false): Promise<SpaService[]> {
  try {
    const colRef = collection(db, 'spaServices');
    const q = includeDrafts ? colRef : query(colRef, where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !includeDrafts) return DEMO_SPA_SERVICES;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SpaService, 'id'>) }));
  } catch (error) {
    if (!includeDrafts) return DEMO_SPA_SERVICES;
    handleFirestoreError(error, OperationType.LIST, 'spaServices');
  }
}

export async function upsertSpaService(service: SpaService): Promise<void> {
  try {
    await setDoc(doc(db, 'spaServices', service.id), { ...service, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `spaServices/${service.id}`);
  }
}

export async function deleteSpaService(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'spaServices', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `spaServices/${id}`);
  }
}

export async function fetchSalonServices(includeDrafts = false): Promise<SalonService[]> {
  try {
    const colRef = collection(db, 'salonServices');
    const q = includeDrafts ? colRef : query(colRef, where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !includeDrafts) return DEMO_SALON_SERVICES;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SalonService, 'id'>) }));
  } catch (error) {
    if (!includeDrafts) return DEMO_SALON_SERVICES;
    handleFirestoreError(error, OperationType.LIST, 'salonServices');
  }
}

export async function upsertSalonService(service: SalonService): Promise<void> {
  try {
    await setDoc(doc(db, 'salonServices', service.id), { ...service, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `salonServices/${service.id}`);
  }
}

export async function deleteSalonService(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'salonServices', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `salonServices/${id}`);
  }
}

export async function fetchCategories(includeInactive = false): Promise<ServiceCategory[]> {
  try {
    const colRef = collection(db, 'serviceCategories');
    const q = includeInactive ? colRef : query(colRef, where('active', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !includeInactive) return DEMO_CATEGORIES;
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceCategory, 'id'>) }))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (error) {
    if (!includeInactive) return DEMO_CATEGORIES;
    handleFirestoreError(error, OperationType.LIST, 'serviceCategories');
  }
}

export async function upsertCategory(category: ServiceCategory): Promise<void> {
  try {
    await setDoc(doc(db, 'serviceCategories', category.id), category, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `serviceCategories/${category.id}`);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'serviceCategories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `serviceCategories/${id}`);
  }
}

export async function fetchPackages(includeDrafts = false): Promise<WellnessPackage[]> {
  try {
    const colRef = collection(db, 'packages');
    const q = includeDrafts ? colRef : query(colRef, where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !includeDrafts) return DEMO_PACKAGES;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WellnessPackage, 'id'>) }));
  } catch (error) {
    if (!includeDrafts) return DEMO_PACKAGES;
    handleFirestoreError(error, OperationType.LIST, 'packages');
  }
}

export async function upsertPackage(pkg: WellnessPackage): Promise<void> {
  try {
    await setDoc(doc(db, 'packages', pkg.id), pkg, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `packages/${pkg.id}`);
  }
}

export async function deletePackage(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'packages', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `packages/${id}`);
  }
}

export async function fetchStaff(includeUnavailable = false): Promise<StaffMember[]> {
  try {
    const colRef = collection(db, 'staff');
    const q = includeUnavailable ? colRef : query(colRef, where('availableForBooking', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !includeUnavailable) return DEMO_STAFF;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StaffMember, 'id'>) }));
  } catch (error) {
    if (!includeUnavailable) return DEMO_STAFF;
    handleFirestoreError(error, OperationType.LIST, 'staff');
  }
}

export async function upsertStaff(member: StaffMember): Promise<void> {
  try {
    await setDoc(doc(db, 'staff', member.id), member, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `staff/${member.id}`);
  }
}

export async function deleteStaff(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'staff', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `staff/${id}`);
  }
}

export async function fetchRooms(includeInactive = false): Promise<SpaRoom[]> {
  try {
    const colRef = collection(db, 'spaRooms');
    const q = includeInactive ? colRef : query(colRef, where('status', 'in', ['available', 'maintenance']));
    const snap = await getDocs(q);
    if (snap.empty && !includeInactive) return DEMO_ROOMS;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SpaRoom, 'id'>) }));
  } catch (error) {
    if (!includeInactive) return DEMO_ROOMS;
    handleFirestoreError(error, OperationType.LIST, 'spaRooms');
  }
}

export async function upsertRoom(room: SpaRoom): Promise<void> {
  try {
    await setDoc(doc(db, 'spaRooms', room.id), room, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `spaRooms/${room.id}`);
  }
}

export async function deleteRoom(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'spaRooms', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `spaRooms/${id}`);
  }
}

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'business'));
    if (!snap.exists()) return DEFAULT_BUSINESS_SETTINGS;
    return { ...DEFAULT_BUSINESS_SETTINGS, ...(snap.data() as Partial<BusinessSettings>), id: 'business' };
  } catch {
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

export async function saveBusinessSettings(settings: BusinessSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'business'), { ...settings, id: 'business', updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/business');
  }
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function slotWindowsOverlap(
  aStart: number,
  aEndWithBuffer: number,
  bStart: number,
  bEndWithBuffer: number
): boolean {
  return aStart < bEndWithBuffer && aEndWithBuffer > bStart;
}

export async function fetchBookingSlotsByDate(date: string): Promise<BookingSlot[]> {
  try {
    const q = query(collection(db, 'bookingSlots'), where('date', '==', date));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<BookingSlot, 'id'>),
      createdAt: normalizeTimestamp(d.data().createdAt),
    }));
  } catch {
    return [];
  }
}

export function subscribeBookingSlotsByDate(
  date: string,
  onData: (slots: BookingSlot[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(collection(db, 'bookingSlots'), where('date', '==', date));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<BookingSlot, 'id'>),
          createdAt: normalizeTimestamp(d.data().createdAt),
        }))
      );
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export interface AtomicBookingOptions {
  candidateStaff?: Array<{ id: string; name: string }>;
  candidateRooms?: Array<{ id: string; name: string }>;
}

export async function createAtomicBooking(
  booking: Omit<Booking, 'createdAt' | 'updatedAt'>,
  options?: AtomicBookingOptions
): Promise<Booking> {
  // Fresh pre-commit conflict verification against live bookingSlots
  const freshSlots = await fetchBookingSlotsByDate(booking.date);
  const activeDaySlots = freshSlots.filter(
    (s) => s.status !== 'cancelled' && s.status !== 'rejected' && s.status !== 'no_show'
  );
  const startMins = timeToMinutes(booking.startTime);
  const bufferMins = Math.max(0, booking.bufferMinutes ?? 15);
  const endWithBuffer = timeToMinutes(booking.endTime) + bufferMins;
  const existingBufferFallback = Math.max(10, bufferMins);

  let finalStaffId = booking.staffId;
  let finalStaffName = booking.staffName;

  if (finalStaffId) {
    const staffConflict = activeDaySlots.find((s) => {
      if (s.staffId !== finalStaffId) return false;
      const sStart = timeToMinutes(s.startTime);
      const sEndBuf = timeToMinutes(s.endTime) + existingBufferFallback;
      return slotWindowsOverlap(startMins, endWithBuffer, sStart, sEndBuf);
    });
    if (staffConflict) {
      throw new Error(
        `BOOKING_CONFLICT: Selected specialist is already reserved around ${booking.startTime}. Please select another slot or specialist.`
      );
    }
  } else if (options?.candidateStaff && options.candidateStaff.length > 0) {
    const freeStaff = options.candidateStaff.find(
      (cand) =>
        !activeDaySlots.some((s) => {
          if (s.staffId !== cand.id) return false;
          const sStart = timeToMinutes(s.startTime);
          const sEndBuf = timeToMinutes(s.endTime) + existingBufferFallback;
          return slotWindowsOverlap(startMins, endWithBuffer, sStart, sEndBuf);
        })
    );
    if (!freeStaff) {
      throw new Error(
        'BOOKING_CONFLICT: All eligible specialists were just booked for this window. Please pick another time.'
      );
    }
    finalStaffId = freeStaff.id;
    finalStaffName = freeStaff.name;
  }

  let finalRoomId = booking.roomId;
  let finalRoomName = booking.roomName;

  if (finalRoomId) {
    const roomConflict = activeDaySlots.find((s) => {
      if (s.roomId !== finalRoomId) return false;
      const sStart = timeToMinutes(s.startTime);
      const sEndBuf = timeToMinutes(s.endTime) + existingBufferFallback;
      return slotWindowsOverlap(startMins, endWithBuffer, sStart, sEndBuf);
    });
    if (roomConflict) {
      throw new Error(
        `BOOKING_CONFLICT: Selected suite/room is occupied or in cleaning buffer at ${booking.startTime}. Please pick another suite or time.`
      );
    }
  } else if (options?.candidateRooms && options.candidateRooms.length > 0) {
    const freeRoom = options.candidateRooms.find(
      (rm) =>
        !activeDaySlots.some((s) => {
          if (s.roomId !== rm.id) return false;
          const sStart = timeToMinutes(s.startTime);
          const sEndBuf = timeToMinutes(s.endTime) + existingBufferFallback;
          return slotWindowsOverlap(startMins, endWithBuffer, sStart, sEndBuf);
        })
    );
    if (!freeRoom) {
      throw new Error(
        'BOOKING_CONFLICT: All matching suites were just reserved for this window. Please select another time.'
      );
    }
    finalRoomId = freeRoom.id;
    finalRoomName = freeRoom.name;
  }

  try {
    const batch = writeBatch(db);
    const bookingRefDoc = doc(db, 'bookings', booking.id);
    const slotRefDoc = doc(db, 'bookingSlots', booking.id);

    const finalized: Omit<Booking, 'createdAt' | 'updatedAt'> = {
      ...booking,
      staffId: finalStaffId,
      staffName: finalStaffName || booking.staffName,
      roomId: finalRoomId,
      roomName: finalRoomName || booking.roomName,
    };

    const payload: Record<string, unknown> = {
      ...finalized,
      createdAt: serverTimestamp(),
    };
    if (!payload.userId) delete payload.userId;
    if (!payload.staffId) delete payload.staffId;
    if (!payload.roomId) delete payload.roomId;
    if (!payload.customerEmail) delete payload.customerEmail;
    if (!payload.notes) delete payload.notes;
    if (!payload.comfortPreferences) delete payload.comfortPreferences;

    const slotPayload: Record<string, unknown> = {
      id: finalized.id,
      bookingId: finalized.id,
      date: finalized.date,
      startTime: finalized.startTime,
      endTime: finalized.endTime,
      status: finalized.status,
      createdAt: serverTimestamp(),
    };
    if (finalized.staffId) slotPayload.staffId = finalized.staffId;
    if (finalized.roomId) slotPayload.roomId = finalized.roomId;

    batch.set(bookingRefDoc, payload);
    batch.set(slotRefDoc, slotPayload);

    await batch.commit();

    return {
      ...finalized,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `bookings/${booking.id}`);
  }
}

export async function fetchBookingsForAdmin(): Promise<Booking[]> {
  try {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        ...(data as Booking),
        id: d.id,
        createdAt: normalizeTimestamp(data.createdAt),
        updatedAt: data.updatedAt ? normalizeTimestamp(data.updatedAt) : undefined,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'bookings');
  }
}

export async function fetchMyBookings(userId: string): Promise<Booking[]> {
  try {
    const q = query(collection(db, 'bookings'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          ...(data as Booking),
          id: d.id,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: data.updatedAt ? normalizeTimestamp(data.updatedAt) : undefined,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'bookings');
  }
}

export async function updateBookingStatusAndAllocation(
  bookingId: string,
  updates: Partial<Pick<Booking, 'status' | 'staffId' | 'staffName' | 'roomId' | 'roomName' | 'date' | 'startTime' | 'endTime' | 'paymentStatus' | 'notes'>>
): Promise<void> {
  // Prevent overlapping schedule/staff/room updates against active bookingSlots
  if (
    updates.date !== undefined ||
    updates.startTime !== undefined ||
    updates.endTime !== undefined ||
    updates.staffId !== undefined ||
    updates.roomId !== undefined
  ) {
    const currentSnap = await getDoc(doc(db, 'bookingSlots', bookingId));
    const currentSlot = currentSnap.exists() ? (currentSnap.data() as BookingSlot) : null;
    const targetDate = updates.date || currentSlot?.date;
    const targetStart = updates.startTime || currentSlot?.startTime;
    const targetEnd = updates.endTime || currentSlot?.endTime;
    const targetStaffId = updates.staffId !== undefined ? updates.staffId : currentSlot?.staffId;
    const targetRoomId = updates.roomId !== undefined ? updates.roomId : currentSlot?.roomId;

    if (targetDate && targetStart && targetEnd && updates.status !== 'cancelled' && updates.status !== 'rejected') {
      const sameDaySlots = await fetchBookingSlotsByDate(targetDate);
      const startMins = timeToMinutes(targetStart);
      const endWithBuffer = timeToMinutes(targetEnd) + 15;
      for (const s of sameDaySlots) {
        if (s.bookingId === bookingId) continue;
        if (s.status === 'cancelled' || s.status === 'rejected' || s.status === 'no_show') continue;
        const sStart = timeToMinutes(s.startTime);
        const sEndBuf = timeToMinutes(s.endTime) + 15;
        if (!slotWindowsOverlap(startMins, endWithBuffer, sStart, sEndBuf)) continue;
        if (targetStaffId && s.staffId === targetStaffId) {
          throw new Error(
            `BOOKING_CONFLICT: Specialist already has another booking (${s.startTime}–${s.endTime}) on ${targetDate}.`
          );
        }
        if (targetRoomId && s.roomId === targetRoomId) {
          throw new Error(
            `BOOKING_CONFLICT: Suite/room is already reserved (${s.startTime}–${s.endTime}) on ${targetDate}.`
          );
        }
      }
    }
  }

  try {
    const batch = writeBatch(db);
    const nowIso = new Date().toISOString();
    batch.update(doc(db, 'bookings', bookingId), { ...updates, updatedAt: nowIso });

    const slotUpdates: Record<string, unknown> = {};
    if (updates.status) slotUpdates.status = updates.status;
    if (updates.staffId !== undefined) slotUpdates.staffId = updates.staffId;
    if (updates.roomId !== undefined) slotUpdates.roomId = updates.roomId;
    if (updates.date) slotUpdates.date = updates.date;
    if (updates.startTime) slotUpdates.startTime = updates.startTime;
    if (updates.endTime) slotUpdates.endTime = updates.endTime;

    if (Object.keys(slotUpdates).length > 0) {
      batch.update(doc(db, 'bookingSlots', bookingId), slotUpdates);
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

export async function deleteBookingRecord(bookingId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'bookings', bookingId));
    batch.delete(doc(db, 'bookingSlots', bookingId));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bookings/${bookingId}`);
  }
}

export async function cancelOwnBooking(bookingId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'bookings', bookingId), {
      status: 'cancelled' as BookingStatus,
      updatedAt: new Date().toISOString(),
    });
    batch.update(doc(db, 'bookingSlots', bookingId), {
      status: 'cancelled' as BookingStatus,
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

export async function fetchGallery(includeDrafts = false): Promise<GalleryItem[]> {
  try {
    const colRef = collection(db, 'gallery');
    const q = includeDrafts ? colRef : query(colRef, where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !includeDrafts) return DEMO_GALLERY;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, 'id'>) }));
  } catch (error) {
    if (!includeDrafts) return DEMO_GALLERY;
    handleFirestoreError(error, OperationType.LIST, 'gallery');
  }
}

export async function upsertGalleryItem(item: GalleryItem): Promise<void> {
  try {
    await setDoc(doc(db, 'gallery', item.id), item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `gallery/${item.id}`);
  }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'gallery', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
  }
}

export async function fetchSocialPosts(includeDrafts = false): Promise<SocialPost[]> {
  try {
    const colRef = collection(db, 'socialPosts');
    const q = includeDrafts ? colRef : query(colRef, where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !includeDrafts) return DEMO_SOCIAL_POSTS;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SocialPost, 'id'>) }));
  } catch (error) {
    if (!includeDrafts) return DEMO_SOCIAL_POSTS;
    handleFirestoreError(error, OperationType.LIST, 'socialPosts');
  }
}

export async function upsertSocialPost(post: SocialPost): Promise<void> {
  try {
    await setDoc(doc(db, 'socialPosts', post.id), post, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `socialPosts/${post.id}`);
  }
}

export async function deleteSocialPost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'socialPosts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `socialPosts/${id}`);
  }
}

export async function fetchBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  try {
    const colRef = collection(db, 'blogPosts');
    const q = includeDrafts ? colRef : query(colRef, where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !includeDrafts) return DEMO_BLOG_POSTS;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) }));
  } catch (error) {
    if (!includeDrafts) return DEMO_BLOG_POSTS;
    handleFirestoreError(error, OperationType.LIST, 'blogPosts');
  }
}

export async function upsertBlogPost(post: BlogPost): Promise<void> {
  try {
    await setDoc(doc(db, 'blogPosts', post.id), post, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `blogPosts/${post.id}`);
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'blogPosts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `blogPosts/${id}`);
  }
}

export async function fetchOffers(includeInactive = false): Promise<Offer[]> {
  try {
    const colRef = collection(db, 'offers');
    const q = includeInactive ? colRef : query(colRef, where('active', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !includeInactive) return DEMO_OFFERS;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Offer, 'id'>) }));
  } catch (error) {
    if (!includeInactive) return DEMO_OFFERS;
    handleFirestoreError(error, OperationType.LIST, 'offers');
  }
}

export async function upsertOffer(offer: Offer): Promise<void> {
  try {
    await setDoc(doc(db, 'offers', offer.id), offer, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `offers/${offer.id}`);
  }
}

export async function deleteOffer(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'offers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `offers/${id}`);
  }
}

export async function fetchReviews(includePending = false): Promise<Review[]> {
  try {
    const colRef = collection(db, 'reviews');
    const q = includePending ? colRef : query(colRef, where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !includePending) return DEMO_REVIEWS;
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Review, 'id'>),
      createdAt: normalizeTimestamp(d.data().createdAt),
    }));
  } catch (error) {
    if (!includePending) return DEMO_REVIEWS;
    handleFirestoreError(error, OperationType.LIST, 'reviews');
  }
}

export async function submitReview(review: Omit<Review, 'createdAt'>): Promise<void> {
  try {
    await setDoc(doc(db, 'reviews', review.id), {
      ...review,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `reviews/${review.id}`);
  }
}

export async function updateReviewPublish(id: string, published: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'reviews', id), { published });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reviews/${id}`);
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'reviews', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `reviews/${id}`);
  }
}

export async function fetchHolidays(): Promise<Holiday[]> {
  try {
    const q = query(collection(db, 'holidays'), where('date', '>=', '2020-01-01'));
    const snap = await getDocs(q);
    if (snap.empty) return DEMO_HOLIDAYS;
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Holiday, 'id'>) }));
  } catch {
    return DEMO_HOLIDAYS;
  }
}

export async function upsertHoliday(holiday: Holiday): Promise<void> {
  try {
    await setDoc(doc(db, 'holidays', holiday.id), holiday, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `holidays/${holiday.id}`);
  }
}

export async function deleteHoliday(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'holidays', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `holidays/${id}`);
  }
}

export async function fetchCustomersForAdmin(): Promise<CustomerRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'customers'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CustomerRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'customers');
  }
}

export async function upsertCustomer(customer: CustomerRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'customers', customer.id), { ...customer, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `customers/${customer.id}`);
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'customers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `customers/${id}`);
  }
}

export async function fetchPaymentsForAdmin(): Promise<PaymentRecord[]> {
  try {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PaymentRecord, 'id'>),
      createdAt: normalizeTimestamp(d.data().createdAt),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'payments');
  }
}

export async function createPaymentRecord(record: Omit<PaymentRecord, 'createdAt'>): Promise<void> {
  try {
    const payload: Record<string, unknown> = {
      ...record,
      createdAt: serverTimestamp(),
    };
    if (!payload.userId) delete payload.userId;
    await setDoc(doc(db, 'payments', record.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `payments/${record.id}`);
  }
}

export async function updatePaymentRecordStatus(
  id: string,
  status: PaymentRecord['status']
): Promise<void> {
  try {
    await updateDoc(doc(db, 'payments', id), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `payments/${id}`);
  }
}

export async function submitContactMessage(msg: Omit<ContactMessage, 'createdAt' | 'status'>): Promise<void> {
  try {
    await setDoc(doc(db, 'contactMessages', msg.id), {
      ...msg,
      status: 'new',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `contactMessages/${msg.id}`);
  }
}

export async function fetchContactMessagesForAdmin(): Promise<ContactMessage[]> {
  try {
    const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ContactMessage, 'id'>),
      createdAt: normalizeTimestamp(d.data().createdAt),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'contactMessages');
  }
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessage['status']
): Promise<void> {
  try {
    await updateDoc(doc(db, 'contactMessages', id), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `contactMessages/${id}`);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'contactMessages', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `contactMessages/${id}`);
  }
}

export async function fetchAdminUsers(): Promise<AdminUserRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'admins'));
    return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AdminUserRecord, 'uid'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'admins');
  }
}

export async function upsertAdminUser(record: AdminUserRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'admins', record.uid), record, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `admins/${record.uid}`);
  }
}

export async function deleteAdminUser(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'admins', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `admins/${uid}`);
  }
}

export async function writeAuditLog(entry: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
  try {
    const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await setDoc(doc(db, 'auditLogs', id), {
      id,
      ...entry,
      actorEmail: entry.actorEmail || auth.currentUser?.email || 'system',
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Audit logging should not block primary admin UI action
  }
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const q = query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLog, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'auditLogs');
  }
}

export async function checkIsCurrentUserAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return false;
  if (user.email === 'alamayub000@gmail.com') return true;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists() && snap.data()?.active === true;
  } catch {
    return false;
  }
}

export async function seedDemoCatalogToFirestore(): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, 'settings', 'business'), { ...DEFAULT_BUSINESS_SETTINGS, updatedAt: new Date().toISOString() }, { merge: true });
  DEMO_CATEGORIES.forEach((c) => batch.set(doc(db, 'serviceCategories', c.id), c, { merge: true }));
  DEMO_SPA_SERVICES.forEach((s) => batch.set(doc(db, 'spaServices', s.id), s, { merge: true }));
  DEMO_SALON_SERVICES.forEach((s) => batch.set(doc(db, 'salonServices', s.id), s, { merge: true }));
  DEMO_PACKAGES.forEach((p) => batch.set(doc(db, 'packages', p.id), p, { merge: true }));
  DEMO_STAFF.forEach((m) => batch.set(doc(db, 'staff', m.id), m, { merge: true }));
  DEMO_ROOMS.forEach((r) => batch.set(doc(db, 'spaRooms', r.id), r, { merge: true }));
  DEMO_GALLERY.forEach((g) => batch.set(doc(db, 'gallery', g.id), g, { merge: true }));
  DEMO_SOCIAL_POSTS.forEach((p) => batch.set(doc(db, 'socialPosts', p.id), p, { merge: true }));
  DEMO_BLOG_POSTS.forEach((b) => batch.set(doc(db, 'blogPosts', b.id), b, { merge: true }));
  DEMO_OFFERS.forEach((o) => batch.set(doc(db, 'offers', o.id), o, { merge: true }));
  DEMO_REVIEWS.forEach((r) => batch.set(doc(db, 'reviews', r.id), r, { merge: true }));
  DEMO_HOLIDAYS.forEach((h) => batch.set(doc(db, 'holidays', h.id), h, { merge: true }));
  await batch.commit();
}
