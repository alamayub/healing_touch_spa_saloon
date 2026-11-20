# Healing Touch Spa & Saloon — Deployment & Architecture Guide

## Overview
Full-stack luxury spa & unisex salon management platform built for **Healing Touch Spa & Saloon** (Aadarsh Nagar, Birgunj, Parsa, Madhesh Province, Nepal).

## Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit + RTK Query, React Router, React Hook Form + Zod, Motion, Recharts, Lucide Icons
- **Backend**: Node.js + Express (`server.ts`) serving Vite dev middleware / static production build, availability & cleaning-buffer engine, Nepal payment sandbox verification, and SEO endpoints (`/sitemap.xml`, `/robots.txt`)
- **Database & Auth**: Firebase Firestore + Firebase Authentication (Google Sign-In) with hardened 8-pillar security rules (`firestore.rules`)

## Commands
- Development server (port 3000): `npm run dev`
- Typecheck: `npm run lint`
- Production build: `npm run build`
- Production start: `npm start`

## Environment Variables (`.env.example`)
- `GEMINI_API_KEY` (optional server-side key)
- `APP_URL` (public host URL)
- `PAYMENT_SANDBOX_SECRET` (HMAC secret for sandbox eSewa/Khalti/Fonepay verification)

## Nepal Payment Integration Notes
The `/api/payments/initiate` and `/api/payments/verify` endpoints enforce server-authoritative verification before any online payment is marked verified. Replace the sandbox token check with official merchant API credentials (eSewa ePay v2, Khalti ePayment v2, or Fonepay QR merchant API) before accepting live payments.

## Admin Onboarding
1. Navigate to `/admin` and sign in with your authorized Google account.
2. Open **Website Settings** and click **Seed Catalog to Firestore** to populate editable services, categories, rooms, staff, and Nepal festival holidays.
3. Update business hours, verified staff details, Cloudinary image URLs, and age/hygiene policies directly in the dashboard.
