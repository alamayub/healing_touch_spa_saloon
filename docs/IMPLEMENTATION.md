# Implementation Architecture — Healing Touch Spa & Saloon

## 1. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **UI & Styling** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion for React, Recharts |
| **Routing & Forms** | React Router DOM v7 (`BrowserRouter`), React Hook Form, Zod (`@hookform/resolvers`) |
| **State & Data** | Redux Toolkit (`uiSlice`), RTK Query (`apiSlice` with `fakeBaseQuery` + `onCacheEntryAdded`) |
| **Backend Server** | Node.js + Express (`server.ts`), Vite middleware (dev) / static `dist/` serving (prod), CORS, `express-rate-limit` |
| **Database & Auth** | Firebase Firestore Enterprise (`ai-studio-...`), Firebase Authentication (Google Popup Sign-In), `firestore.rules` |

---

## 2. Project Directory Layout

```text
├── public/
│   └── images/                  # 18 curated real spa, hydrotherapy, salon, bridal & portrait photos
├── src/
│   ├── components/
│   │   ├── layout/              # Navbar, Footer, PublicLayout, WhatsAppButton
│   │   ├── ui/                  # LuxuryVisual, MotionPrimitives, TreatmentRitualModal, NepaleseCalendarBadge
│   │   └── SeoHead.tsx          # Dynamic per-route <title>, meta description, and OpenGraph sync
│   ├── data/
│   │   └── demoCatalog.ts       # Seedable business settings, categories, services, packages, staff, rooms, gallery
│   ├── i18n/
│   │   └── translations.ts      # English & Nepali dictionary (`en` | `ne`)
│   ├── lib/
│   │   └── firebase.ts          # Firebase App, Auth, Firestore (forceLongPolling) & super-admin email helper
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx        # Tabbed shell, Google Auth gate & admin navigation
│   │   │   ├── AdminAnalyticsAndBookings.tsx # KPIs, Recharts reports, bookings, schedules, rooms, payments, CRM
│   │   │   └── AdminCatalogAndSystem.tsx     # Spa/Salon services, categories, packages, staff, rooms, CMS, settings, RBAC
│   │   ├── BookingPage.tsx      # 8-step booking wizard with couples, staff/room matching & payment checkout
│   │   ├── MyBookingsPage.tsx   # Guest reservation tracker, conflict-checked reschedule & cancel
│   │   ├── HomePage.tsx         # Sanctuary hero, dual catalogs, experience pillars, team, offers & Birgunj map
│   │   ├── SpaServicesPage.tsx  # Filterable spa catalog & ritual details
│   │   ├── SalonServicesPage.tsx# Filterable unisex salon catalog
│   │   ├── PackagesPage.tsx     # Signature combo deals
│   │   ├── TeamPage.tsx         # Therapists & salon stylists directory
│   │   ├── GalleryPage.tsx      # Masonry visual archive with Before/After lightbox
│   │   ├── ExperiencePage.tsx   # Suites, hydrotherapy, couples experience & etiquette
│   │   ├── AboutPage.tsx        # Story, values & hygiene standards
│   │   ├── ContactPage.tsx      # Location desk, WhatsApp & validated inquiry form
│   │   └── SecondaryPages.tsx   # Offers, Social feed, Blog list/detail, Reviews, FAQ, Privacy, Terms, 404
│   ├── services/
│   │   └── firestoreService.ts  # Firestore queries, atomic booking batch writes, real-time listeners & audit helpers
│   ├── store/
│   │   ├── api/
│   │   │   ├── apiSlice.ts      # RTK Query root slice & cache tag definitions
│   │   │   └── endpoints.ts     # Injected catalog, booking, conflict, CRM & content endpoints
│   │   ├── slices/uiSlice.ts    # Language (`en`/`ne`), auth state, booking draft & session booking refs
│   │   └── index.ts             # Configured Redux store & typed hooks
│   ├── types/domain.ts          # Canonical TypeScript interfaces shared across UI and services
│   └── utils/nepal.ts           # NPR formatting, Bikram Sambat conversion, Kathmandu date/time & phone validation
├── server.ts                    # Express API server + HTTP server wrapper + Vite/dist integration
├── firestore.rules              # Hardened Firestore security rules (PII isolation + RBAC)
└── firebase-blueprint.json      # Schema blueprint across all 21 Firestore collections
```

---

## 3. Booking, Room Allocation & Conflict Engine

The booking pipeline prevents double-bookings and enforces physical turnaround times through three coordinated layers:

### Layer A: Room & Specialist Candidate Matching (`BookingPage.tsx`)
1. **Occupancy Filtering**: When `isCouple === true`, `BookingPage` filters rooms to suites where `status === 'available'`, `supportsCouple === true`, and `capacity >= 2`.
2. **Room-Type Matching**: Spa services match `roomTypeRequired` (e.g., `hydro_suite`, `couple_suite`, `reflexology_lounge`, `single_suite`); Salon services match `salon_studio` or `bridal_suite`.
3. **Specialist Matching**: Filters active staff by division (`spa`, `salon`, `both`) and optionally lets couples add a **Partner Companion Therapist**.

### Layer B: Slot Calculation & Cleaning Buffers (`/server.ts`)
- `POST /api/availability` iterates in 30-minute intervals between effective `openTime` and `closeTime` (accounting for Nepal holiday closures, custom holiday `specialHours`, and Kathmandu `+30m` same-day lead time).
- For every candidate slot `[start, end]`, the sanitization buffer extends occupancy to `endWithBuffer = start + durationMinutes + bufferMinutes`.
- Each active existing booking blocks `[bookedStart, bookedEnd + defaultExistingBuffer]`, rejecting overlaps whether a new booking lands inside a treatment OR inside its post-session cleaning buffer.
- Computes `availableStaffIds[]` and `availableRoomIds[]` for transparent slot badges in the UI.

### Layer C: Real-Time Streaming + Atomic Commit (`firestoreService.ts` + `endpoints.ts`)
1. `getBookingSlotsByDate` opens a live Firestore `onSnapshot` listener (`subscribeBookingSlotsByDate`), updating UI availability immediately whenever another user books or cancels.
2. Before writing to Firestore, `BookingPage` and `MyBookingsPage` invoke `POST /api/bookings/check-conflict`, which either confirms & auto-assigns a conflict-free specialist + room or rejects with HTTP `409 Conflict`.
3. `createAtomicBooking` runs a fresh pre-commit read on `bookingSlots` for the target date inside `firestoreService.ts` and throws `BOOKING_CONFLICT` on any overlapping staff/room slot before executing a `writeBatch` to commit both `/bookings/{id}` and `/bookingSlots/{id}` atomically.

---

## 4. Real Photography Asset System

- Inline SVG scene placeholders were completely removed from `LuxuryVisual.tsx`.
- All 18 verified photographic assets live under `/public/images/*.jpg` and are mapped deterministically via `REAL_VISUAL_IMAGES[visualKey]`, with optional custom admin `imageUrl` / `avatarUrl` overrides.
- If an admin-supplied custom URL fails to load (`onError`), `LuxuryVisual` gracefully falls back to the curated local studio photograph for that treatment category rather than showing a broken icon.
- Portrait keys (`team_portrait`, `salon_bridal`, `salon_keratin`, `salon_haircut`) apply `object-top` framing to keep faces and bridal styling unclipped.

---

## 5. Authentication & State Management

- `App.tsx` attaches a global `onAuthStateChanged` listener to Firebase Auth and resolves admin access via `resolveIsAdminUser(uid, email, emailVerified)` (checking both the verified bootstrap super-admin email and active records in `/admins/{uid}`).
- RTK Query manages all catalog, booking, CRM, payment, and CMS caches via tag invalidation (`Services`, `Categories`, `Packages`, `Staff`, `Rooms`, `Bookings`, `BookingSlots`, `Payments`, `Customers`, `Content`, `Settings`, `Admins`, `AuditLogs`, `ContactMessages`).
- Falls back cleanly to `demoCatalog.ts` for public read collections whenever Firestore is unseeded or temporarily unreachable, so the storefront remains functional out of the box.
