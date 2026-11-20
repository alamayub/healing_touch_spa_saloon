export type LanguageCode = 'en' | 'ne';

export type BookingCategory = 'spa' | 'salon' | 'package';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no_show';
export type PaymentMethod = 'cash' | 'esewa' | 'khalti' | 'fonepay';
export type PaymentStatus = 'pending' | 'advance_paid' | 'paid' | 'refunded' | 'failed';
export type StaffDivision = 'spa' | 'salon' | 'both' | 'management';
export type RoomType = 'single_suite' | 'couple_suite' | 'hydro_suite' | 'reflexology_lounge' | 'salon_studio' | 'bridal_suite';
export type UserRole = 'super_admin' | 'manager' | 'receptionist' | 'therapist' | 'stylist';

export type VisualKey =
  | 'hero_sanctuary'
  | 'spa_massage'
  | 'spa_aroma'
  | 'spa_hot_stone'
  | 'spa_couple'
  | 'spa_hydro'
  | 'spa_reflexology'
  | 'salon_lounge'
  | 'salon_haircut'
  | 'salon_bridal'
  | 'salon_keratin'
  | 'salon_facial'
  | 'salon_nails'
  | 'package_ritual'
  | 'team_portrait';

export interface ServiceCategory {
  id: string;
  name: string;
  nameNe?: string;
  division: 'spa' | 'salon';
  description?: string;
  sortOrder: number;
  active: boolean;
}

export interface SpaService {
  id: string;
  name: string;
  nameNe?: string;
  category: string;
  description: string;
  involves?: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceNpr: number;
  couplePriceNpr?: number;
  supportsCouple: boolean;
  roomTypeRequired?: RoomType | 'any';
  imageUrl?: string;
  visualKey?: VisualKey;
  featured: boolean;
  published: boolean;
  verifiedByBusiness: boolean;
  isDemo?: boolean;
}

export interface SalonService {
  id: string;
  name: string;
  nameNe?: string;
  category: string;
  audience: 'unisex' | 'women' | 'men';
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceNpr: number;
  imageUrl?: string;
  visualKey?: VisualKey;
  featured: boolean;
  published: boolean;
  verifiedByBusiness: boolean;
  isDemo?: boolean;
}

export interface WellnessPackage {
  id: string;
  name: string;
  nameNe?: string;
  category: string;
  description: string;
  includedServiceIds: string[];
  includedServiceNames: string[];
  totalDurationMinutes: number;
  packagePriceNpr: number;
  regularPriceNpr?: number;
  savingsVerified: boolean;
  supportsCouple: boolean;
  imageUrl?: string;
  visualKey?: VisualKey;
  featured: boolean;
  published: boolean;
  isDemo?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  division: StaffDivision;
  experienceYears: number;
  bio?: string;
  specializations: string[];
  skills: string[];
  languages: string[];
  workingDays: string[];
  shiftStart: string;
  shiftEnd: string;
  breakStart?: string;
  breakEnd?: string;
  availableForBooking: boolean;
  verified: boolean;
  isDemo?: boolean;
  avatarUrl?: string;
}

export interface SpaRoom {
  id: string;
  name: string;
  roomType: RoomType;
  capacity: number;
  supportsCouple: boolean;
  facilities: string[];
  status: 'available' | 'maintenance' | 'inactive';
  verified: boolean;
  isDemo?: boolean;
  notes?: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  userId?: string;
  category: BookingCategory;
  serviceIds: string[];
  serviceNames: string[];
  isCouple: boolean;
  guestCount: number;
  staffId?: string;
  staffName?: string;
  roomId?: string;
  roomName?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  bufferMinutes: number;
  totalNpr: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  preferredLanguage: LanguageCode;
  notes?: string;
  comfortPreferences?: string;
  consentAccepted: boolean;
  agePolicyConfirmed: boolean;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingSlot {
  id: string;
  bookingId: string;
  date: string;
  startTime: string;
  endTime: string;
  staffId?: string;
  roomId?: string;
  status: BookingStatus;
  createdAt?: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  bookingRef: string;
  userId?: string;
  method: PaymentMethod;
  amountNpr: number;
  isAdvance: boolean;
  status: 'pending' | 'verified' | 'refunded' | 'failed';
  gatewayRef?: string;
  verifiedByServer: boolean;
  createdAt: string;
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  preferredLanguage: LanguageCode;
  preferences?: string;
  totalBookings: number;
  lastVisitDate?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  mediaType: 'image' | 'video' | 'before_after';
  imageUrl?: string;
  beforeImageUrl?: string;
  visualKey?: VisualKey;
  caption?: string;
  published: boolean;
  isDemo?: boolean;
}

export interface SocialPost {
  id: string;
  platform: 'facebook' | 'instagram';
  postType: 'photo' | 'reel' | 'offer' | 'announcement';
  title: string;
  caption: string;
  externalUrl?: string;
  imageUrl?: string;
  visualKey?: VisualKey;
  publishedAt: string;
  published: boolean;
  isDemo?: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readMinutes: number;
  publishedAt: string;
  published: boolean;
  isDemo?: boolean;
}

export interface Offer {
  id: string;
  title: string;
  festivalTag?: string;
  description: string;
  discountLabel: string;
  promoCode?: string;
  validUntil?: string;
  applicableTo: 'spa' | 'salon' | 'packages' | 'all';
  active: boolean;
  isDemo?: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  serviceUsed: string;
  rating: number;
  comment: string;
  userId?: string;
  isDemo?: boolean;
  published: boolean;
  createdAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  bsDate?: string;
  isClosed: boolean;
  specialHours?: string;
}

export interface BusinessSettings {
  id: string;
  businessName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  googleMapsUrl: string;
  openingHoursText: string;
  openTime: string;
  closeTime: string;
  minimumAgeSpa: number;
  agePolicyText: string;
  hygieneStandardsText: string;
  cancellationPolicyText: string;
  showDemoContentBanner: boolean;
  updatedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  status: 'new' | 'replied' | 'archived';
  createdAt: string;
}

export interface AdminUserRecord {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary?: string;
  createdAt: string;
}
