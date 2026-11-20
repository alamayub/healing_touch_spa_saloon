# Requirements Specification — Healing Touch Spa & Saloon

## 1. Business Context & Scope

- **Brand:** Healing Touch Spa & Saloon
- **Geography:** Aadarsh Nagar, Birgunj, Parsa District, Madhesh Province, Nepal
- **Target Audience:** Men, women, couples, families, and bridal/wedding guests seeking restorative massage, steam/jacuzzi hydrotherapy, and unisex hair, skin, nail, and beauty care.
- **Honesty & Accuracy Mandate:**
  - All services, prices (NPR), hours, staff profiles, room facilities, and social posts must be admin-editable.
  - Seeded sample entries must be visibly distinguishable and replaceable once verified by business ownership.
  - Service copy describes treatments transparently without making unsupported medical or therapeutic claims.

---

## 2. Functional Requirements

### FR-01: Brand & Visual System
- Editorial luxury palette: Deep Forest Green (`#183D35`), Warm Cream (`#F6F0E7`), Champagne Gold (`#C4A36A`), Ivory (`#FBF9F5`), Deep Charcoal (`#252525`), and Warm Gray (`#858078`).
- Typography: Cormorant Garamond editorial serif headings paired with Plus Jakarta Sans UI/body text.
- Real Photography: All hero plates, spa/salon cards, gallery items, packages, social updates, and team portraits render real photography (with top framing on human portraits).
- Smooth scrolling and gentle CalmReveal/route transitions across pages.

### FR-02: Public Website Routes
| Route | Page | Core Features |
| :--- | :--- | :--- |
| `/` | Homepage | Full-bleed dual Spa & Salon hero, Nepal strip, featured spa/salon menus, couples/hydrotherapy showcase, packages, facilities, gallery preview, team, reviews, offers, social updates, Birgunj directions & WhatsApp CTA |
| `/spa` | Spa Menu | Filter by category (`Full Body Massage`, `Aromatherapy Massage`, `Deep Tissue Massage`, `Hot Stone Massage`, `Head Massage`, `Foot Reflexology`, `Couple Massage`, `Steam Bath`, `Jacuzzi Experience`, etc.), duration, buffer, NPR/Couple pricing, ritual inspection modal |
| `/salon` | Unisex Salon Menu | Audience filters (`all`, `women`, `men`, `unisex`), category filters (`Haircut`, `Beard Grooming`, `Hair Spa`, `Keratin Treatment`, `Facial`, `Bridal Makeup`, `Party Makeup`, `Manicure/Pedicure`, `Hair Smoothing`), pricing, direct booking |
| `/packages` | Packages | Multi-service ritual combos, total duration, regular vs. package NPR pricing, verified savings badge, couples flag |
| `/experience` | Spa Experience | Dedicated presentation of relaxation suites, couples sanctuary, steam bath, jacuzzi, hygiene standards, and FAQs |
| `/about` | About Us | Studio story, mission/vision, non-medical wellness philosophy, sanitation protocol, and Birgunj standards |
| `/team` | Therapists & Stylists | Division filters (`All`, `Spa`, `Salon`), years of experience, specializations, spoken languages, shift hours, pre-filled staff booking |
| `/gallery` | Visual Gallery | Category filters, masonry layout, Before/After transformation comparison lightbox, video/reel tags, Esc-key modal close |
| `/booking` | Booking Wizard | 8-step reservation experience with live availability, single/couples toggle, room/specialist matching, and conflict prevention |
| `/my-bookings` | My Bookings | Signed-in guest lookup + session reference/phone tracking, conflict-checked reschedule, and cancellation |
| `/offers` | Offers | Seasonal & Nepal festival promotions (Dashain, Tihar, Teej, Chhath, Nepali New Year) with optional promo codes |
| `/social` | Social Updates | Facebook/Instagram filterable studio posts, announcements, and links to official channels |
| `/blog`, `/blog/:slug` | Wellness Journal | Editorial hair-care and spa preparation guides |
| `/reviews` | Guest Reviews | Published testimonials + verified Google account submission (held `published: false` until admin moderation) |
| `/contact` | Contact & Directions | Aadarsh Nagar reception details, WhatsApp/Facebook/Google Maps actions, and validated inquiry form |
| `/faq`, `/privacy-policy`, `/terms`, `*` | Policy & Fallback | Etiquette/age/cancellation policies and custom 404 recovery page |

### FR-03: Advanced Booking & Conflict Prevention Engine
1. Support selecting **Spa Treatment**, **Unisex Salon Service** (multi-select), or **Combo Package**.
2. Support **Single (1 Guest)** or **Couples (2 Guests)** occupancy when supported by the service/package:
   - Automatically restrict room candidates to suites with `supportsCouple === true` and `capacity >= 2`.
   - Allow selecting an optional **Partner Companion Therapist** for couples appointments.
3. Enforce specialist scheduling rules:
   - Active availability (`availableForBooking`), division match, working day (`Sun`–`Sat`), shift boundaries (`shiftStart`–`shiftEnd`), and daily break windows (`breakStart`–`breakEnd`).
4. Enforce suite & room-type constraints:
   - Match treatment `roomTypeRequired` (`hydro_suite`, `couple_suite`, `reflexology_lounge`, `salon_studio`, `single_suite`) and exclude rooms in `maintenance` or `inactive` state.
5. Enforce **Preparation & Sanitization Buffers**:
   - Every slot computes `endTime = startTime + durationMinutes` and `bufferEndTime = endTime + bufferMinutes`.
   - Overlap checks protect both the incoming booking's buffer tail and any active existing booking's post-session cleaning window.
6. Multi-layer concurrency guard:
   - Live client-side slot subscription (`onSnapshot` on `/bookingSlots`).
   - Pre-commit server verification (`POST /api/bookings/check-conflict`) auto-assigning free staff/room or returning `409 Conflict`.
   - Transactional Firestore verification inside `createAtomicBooking` inspecting fresh `/bookingSlots` before commit.

### FR-04: Nepal Payments & Localization
- All prices formatted cleanly in NPR (`NPR 3,200` / `रु ३,२००`).
- Support **Bikram Sambat (BS)** calendar date conversion alongside Gregorian dates.
- Support Kathmandu time (`Asia/Kathmandu`) past-slot cutoff (30-minute lead buffer for same-day bookings).
- Validate Nepal phone numbers (`+977...` / `98...` / `97...`).
- Support **Cash at Reception**, **eSewa**, **Khalti**, and **Fonepay** with server-authoritative HMAC token verification (`/api/payments/initiate` & `/api/payments/verify`).
- Compose pre-filled bilingual **WhatsApp** booking confirmation links plus SMS/Email-ready payload structures.

### FR-05: Admin Management Dashboard (`/admin`)
Provide independent, persistent full CRUD modules for:
1. **Analytics & Reports**: Revenue metrics, division splits, top services, status & payment distribution charts (Recharts).
2. **Bookings Management**: Division filter, status transitions (`pending`, `confirmed`, `completed`, `cancelled`, `rejected`, `no_show`) with conflict validation, inline rescheduling, and deletion.
3. **Spa Services & Salon Services**: Independent forms for pricing, duration, cleaning buffer, couples support, room requirements, publish/featured toggles, and deletion.
4. **Categories & Packages**: Custom spa/salon categories, multi-service combo packages, regular vs. package pricing, and verified savings flags.
5. **Therapists & Salon Staff**: Full team profiles, specializations, skills, working days, shift start/end, break start/end, and booking visibility toggles.
6. **Rooms & Facilities**: Physical suites/studios, capacity, couple readiness, facility lists, and `available` / `maintenance` / `inactive` statuses.
7. **Schedules & Nepal Holidays**: Interactive per-staff weekday/shift/break matrix + Nepal festival closures & special operating hours.
8. **Room Schedule Timeline**: Date-filtered suite occupancy timeline showing guest windows and active cleaning buffers.
9. **Payments & Customer CRM**: Filterable payment ledger, manual desk payment recording synced to booking payment status, and searchable CRM customer profiles.
10. **Content, Moderation & Settings**: Gallery, Social Posts, Offers (with promo codes), Blog Journal, Review Publish/Hide/Delete, Contact Inquiry triage (`new` / `replied` / `archived`), editable Business Settings, Catalog Seeding, Admin Role Access Control, and Audit Trail.

---

## 3. Non-Functional Requirements

- **Security & Privacy (NFR-01):** Strict PII isolation in Firestore (`firestore.rules`). Availability uses anonymized `/bookingSlots` with no guest contact fields; `/bookings`, `/customers`, `/contactMessages`, `/payments`, and `/auditLogs` enforce strict owner/admin RBAC.
- **Validation (NFR-02):** Shared Zod validation schemas in forms and Express routes; max payload sizes enforced (`1mb` JSON body limit) and Express rate limiting (`300 req / 15 min` on `/api/*`).
- **Accessibility & Responsiveness (NFR-03):** Responsive across mobile (`375px+`), tablet, and desktop viewports; semantic landmarks, keyboard `Escape` modal dismissal, high-contrast typography, and `referrerPolicy="no-referrer"` on media tags.
- **Reliability (NFR-04):** Firestore configured with `experimentalForceLongPolling: true` and `ignoreUndefinedProperties: true` for resilient browser connectivity and clean document serialization.
