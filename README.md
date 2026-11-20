# Healing Touch Spa & Saloon — Luxury Wellness & Unisex Salon Platform

Full-stack web application and studio management dashboard built for **Healing Touch Spa & Saloon** in **Aadarsh Nagar, Birgunj, Parsa, Madhesh Province, Nepal**.

- **Location:** Aadarsh Nagar, Birgunj, Parsa, Nepal
- **Public Phone / WhatsApp:** `+977 982-3945000`
- **Timezone:** `Asia/Kathmandu` (Nepal Standard Time, UTC+05:45) with **Bikram Sambat (BS)** calendar display alongside Gregorian dates
- **Languages:** Bilingual **English** and **नेपाली** toggle

---

## Documentation Index

| Document | Purpose |
| :--- | :--- |
| [Requirements Specification](./docs/REQUIREMENTS.md) | Business, functional, localization, booking-engine, admin CRUD, and non-functional requirements |
| [Implementation Architecture](./docs/IMPLEMENTATION.md) | Frontend state/UI architecture, booking & cleaning-buffer engine, real photography system, and backend design |
| [API & RTK Query Reference](./docs/API.md) | Express REST endpoints, request/response schemas, status codes, payment verification, and RTK Query endpoints |
| [Database Blueprint](./firebase-blueprint.json) | 21-collection Firestore entity schemas and field validation constraints |
| [Security Specification](./security_spec.md) | PII isolation, anti-privilege escalation invariants, and Firestore security test vectors |
| [Admin Operations Guide](./docs/ADMIN_GUIDE.md) | Daily reception, scheduling, room management, catalog editing, and CRM workflows |
| [Deployment Guide](./DEPLOYMENT.md) | Environment setup, build commands, payment gateway onboarding, and admin seeding |

---

## Key Capabilities

### Public Guest Experience
- **Dual Spa & Unisex Salon Showcase (`/`, `/spa`, `/salon`, `/packages`, `/experience`)**: Clear distinction between private massage/hydrotherapy suites and unisex hair, keratin, facial, nail, and bridal beauty services, priced in **NPR (रू)**.
- **Advanced Multi-Step Booking Engine (`/booking`)**:
  - Supports **Spa**, **Unisex Salon**, and **Combo Package** bookings.
  - **Single & Couples Mode**: Automatically matches couple-ready suites and offers optional partner therapist selection.
  - **Real-Time Slot & Buffer Conflict Prevention**: Combines live Firestore slot subscriptions with server-side shift, break, working-day, room-type, and cleaning/sanitization buffer checks (`200` auto-assignment or `409 Conflict`).
  - **Nepal Payment & Concierge Options**: Pay at desk (**Cash**) or via **eSewa**, **Khalti**, or **Fonepay** (HMAC-verified sandbox mode), plus bilingual **WhatsApp** booking confirmation summaries.
- **Guest Self-Service & Studio Pages**: `/my-bookings` (look up by ref/phone, reschedule with conflict checking, or cancel), `/team`, `/gallery` (masonry filter + Before/After lightbox), `/offers`, `/social`, `/blog`, `/blog/:slug`, `/reviews`, `/faq`, `/contact`, `/privacy-policy`, `/terms`.

### Comprehensive Admin Dashboard (`/admin`)
- Protected by verified Google Sign-In (`alamayub000@gmail.com` super-admin bootstrap + `/admins/{uid}` RBAC roles).
- Independent **Create, Read, Update, Delete (CRUD)** workflows across:
  - Spa Services & Salon Services & Categories
  - Packages
  - Therapists & Salon Staff (working days, shifts, break windows, skills)
  - Treatment Suites & Facilities (capacity, couple support, maintenance status)
  - Staff Schedules & Nepal Holidays (BS dates + custom holiday hours)
  - Room Timeline View & Conflict-Safe Bookings Management
  - Payments & Receipts + Searchable Customer CRM
  - Gallery, Facebook/Instagram Dispatches, Offers/Promo Codes, Blog Journal, Guest Review Moderation
  - Contact Inquiries inbox, Business Settings, Admin Role Management & Audit Logs, Analytics (Recharts)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and configure optional variables
cp .env.example .env

# 3. Start full-stack dev server (Express + Vite SPA on http://localhost:3000)
npm run dev

# 4. Typecheck (TypeScript)
npm run lint

# 5. Build production bundle and run in production mode
npm run build
NODE_ENV=production npm start
```
