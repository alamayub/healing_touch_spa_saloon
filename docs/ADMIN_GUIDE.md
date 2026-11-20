# Admin Management Operations Guide

Navigate to `/admin` and sign in with your authorized Google account. Initial super-admin access is granted to the verified business owner email configured in `src/lib/firebase.ts` and `firestore.rules`, who can then grant or revoke additional manager, receptionist, therapist, or stylist roles under **Admins & Security**.

---

## 1. Initial Setup & Seeding
1. Open **Settings** in the admin sidebar.
2. Click **Seed Catalog to Firestore** to initialize sample Spa Services, Salon Services, Categories, Packages, Team Members, Rooms, Gallery plates, Social dispatches, Offers, Journal articles, Reviews, and Nepal festival Holidays.
3. Update **Business Settings** with live opening hours, phone, WhatsApp number, email, Google Maps/Facebook/Instagram links, hygiene notes, and cancellation policies.
4. Once sample entries have been replaced with real business content, toggle **Show Demo Content Notice Banner** off.

---

## 2. Managing Services, Categories & Packages
- **Spa Treatments** & **Unisex Salon Services**: Add, edit, toggle Publish/Featured status, or delete offerings. Specify duration, post-treatment cleaning/sanitization buffer (minutes), NPR pricing, couples availability & pricing, required room category, and real image URLs.
- **Categories & Packages**: Maintain ordered division categories (`spa` / `salon`) and build curated multi-service combo packages with verified savings comparisons.

---

## 3. Team, Shifts & Physical Suites
- **Team Members**: Create or edit independent therapists and salon stylists. Configure divisions (`spa`, `salon`, `both`, `management`), specializations, skills, spoken languages, shift start/end times, daily break windows, working days (`Sun`–`Sat`), and public booking availability.
- **Rooms & Facilities**: Manage individual suites (`single_suite`, `couple_suite`, `hydro_suite`, `reflexology_lounge`, `salon_studio`, `bridal_suite`), guest capacity, couple support, included equipment/facilities, and operational status (`available`, `maintenance`, `inactive`). Putting a suite in `maintenance` immediately removes it from public booking allocation.
- **Schedules & Holidays**: Adjust team weekly availability and register Nepal festival closures or reduced festival operating hours (with Bikram Sambat dates).

---

## 4. Reception Desk: Bookings, Timeline, Payments & CRM
- **Bookings**: Filter across Spa, Salon, and Packages. Confirm, complete, cancel, reject, mark `no_show`, inline reschedule (protected by overlap/buffer checks), or delete test records.
- **Room Timeline**: Inspect booked slots and post-session cleaning windows per room for any selected date.
- **Payments**: Filter transactions by gateway (`cash`, `esewa`, `khalti`, `fonepay`) or verification state, record reception desk payments directly, and synchronize linked booking payment statuses.
- **Customers (CRM)**: Search guest profiles, track visit totals and comfort preferences, create manual walk-in profiles, or edit/remove records.

---

## 5. Content, Moderation & Access Security
- Moderate public **Guest Reviews** (approve `Published` or hide/delete).
- Manage **Gallery**, **Social Posts**, **Seasonal Offers & Promo Codes**, and **Wellness Journal** articles.
- Triage public **Contact Inquiries** (`new` → `replied` → `archived`).
- Audit sensitive catalog, booking, and role mutations from **Admins & Security**.
