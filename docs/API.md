# API & RTK Query Reference — Healing Touch Spa & Saloon

Base URL (Development & Production): `/api/*` hosted on port `3000` (`server.ts`).  
Rate Limiting: `300 requests / 15 minutes` per IP across `/api/*`.

---

## 1. Health & SEO Endpoints

### `GET /api/health`
Returns runtime health and Kathmandu timezone verification.

**Response `200 OK`:**
```json
{
  "ok": true,
  "service": "Healing Touch Spa & Saloon API",
  "timezone": "Asia/Kathmandu",
  "timestamp": "2026-11-20T06:16:25.637Z"
}
```

### `GET /robots.txt` & `GET /sitemap.xml`
Dynamically serves crawler directives (disallowing `/admin`) and XML sitemap entries for all public routes.

---

## 2. Availability & Conflict Engine

### `POST /api/availability`
Computes 30-minute time slots for a requested date, enforcing working days, shifts, break windows, holiday closures/hours, room availability, and post-treatment cleaning buffers.

**Request Body:**
```json
{
  "date": "2026-12-10",
  "durationMinutes": 60,
  "bufferMinutes": 15,
  "openTime": "09:30",
  "closeTime": "20:30",
  "staffId": "optional-staff-id",
  "roomId": "optional-room-id",
  "isCouple": true,
  "eligibleStaff": [
    {
      "id": "staff-anita-thapa",
      "name": "Anita Thapa",
      "shiftStart": "09:30",
      "shiftEnd": "19:30",
      "breakStart": "13:30",
      "breakEnd": "14:15",
      "workingDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    }
  ],
  "eligibleRooms": [
    {
      "id": "room-couple-1",
      "name": "Suite 03 — Royal Couples Sanctuary",
      "roomType": "couple_suite",
      "capacity": 2,
      "supportsCouple": true
    }
  ],
  "existingSlots": [
    {
      "id": "bk-existing",
      "date": "2026-12-10",
      "startTime": "10:00",
      "endTime": "11:00",
      "staffId": "staff-anita-thapa",
      "roomId": "room-couple-1",
      "status": "confirmed"
    }
  ],
  "holiday": {
    "name": "Chhath Parva",
    "isClosed": false,
    "specialHours": "12:00 - 19:00"
  }
}
```

**Response `200 OK`:**
```json
{
  "date": "2026-12-10",
  "closed": false,
  "slots": [
    {
      "startTime": "10:00",
      "endTime": "11:00",
      "bufferEndTime": "11:15",
      "available": false,
      "reason": "All matching suites occupied",
      "availableStaffIds": [],
      "availableRoomIds": []
    },
    {
      "startTime": "11:30",
      "endTime": "12:30",
      "bufferEndTime": "12:45",
      "available": true,
      "availableStaffIds": ["staff-anita-thapa"],
      "availableRoomIds": ["room-couple-1"]
    }
  ]
}
```
- Returns `400 Bad Request` with Zod validation `issues` on malformed payloads.
- Cancelled, rejected, and `no_show` slots are automatically ignored as blocking reservations.

---

### `POST /api/bookings/check-conflict`
Pre-commit conflict validator invoked immediately before booking submission or rescheduling. When no specific staff or room is locked (`"any"`), it selects and returns the first conflict-free eligible specialist and suite.

**Additional Required Fields (extends `/api/availability` payload):**
- `startTime` (`"HH:MM"`)
- `endTime` (`"HH:MM"`)

**Response `200 OK` (Slot Clear):**
```json
{
  "conflict": false,
  "assignedStaffId": "staff-anita-thapa",
  "assignedStaffName": "Anita Thapa",
  "assignedRoomId": "room-couple-1",
  "assignedRoomName": "Suite 03 — Royal Couples Sanctuary"
}
```

**Response `409 Conflict` (Overlap, Holiday Closure, or Buffer Collision):**
```json
{
  "conflict": true,
  "reason": "Selected suite is no longer available (Suite cleaning buffer). Please select another slot or suite."
}
```

---

## 3. Nepal Payments (eSewa / Khalti / Fonepay / Cash)

### `POST /api/payments/initiate`
Creates a server-tracked payment session and HMAC-SHA256 verification token.

**Request Body:**
```json
{
  "bookingRef": "HT-TEST-01",
  "method": "esewa",
  "amountNpr": 3500,
  "customerName": "Suman Agrawal"
}
```
`method` enum: `'cash' | 'esewa' | 'khalti' | 'fonepay'`.

**Response `200 OK`:**
```json
{
  "transactionId": "TXN-ESEWA-A5EA8175",
  "bookingRef": "HT-TEST-01",
  "method": "esewa",
  "amountNpr": 3500,
  "currency": "NPR",
  "sandboxMode": true,
  "gatewayToken": "4273d2dccca28057",
  "checkoutNote": "Sandbox ESEWA verification token issued for Suman Agrawal. Complete verification step to confirm."
}
```

---

### `POST /api/payments/verify`
Server-authoritative verification of gateway signature tokens. Client state cannot self-verify payments.

**Request Body:**
```json
{
  "transactionId": "TXN-ESEWA-A5EA8175",
  "bookingRef": "HT-TEST-01",
  "method": "esewa",
  "gatewayToken": "4273d2dccca28057",
  "simulateFailure": false
}
```

**Responses:**
- `200 OK`: `{ "verified": true, "status": "verified", "transactionId": "...", "bookingRef": "...", "method": "esewa", "amountNpr": 3500, "verifiedAt": "..." }`
- `402 Payment Required`: `{ "verified": false, "status": "failed", "error": "Sandbox payment declined or cancelled by user." }`
- `403 Forbidden`: `{ "verified": false, "status": "failed", "error": "Gateway signature mismatch." }`
- `404 Not Found`: `{ "verified": false, "error": "Payment session not found or mismatched." }`

---

## 4. Notifications & WhatsApp Composer

### `POST /api/notifications/compose`
Generates localized (`en` or `ne`) WhatsApp click-to-chat URLs plus structured SMS and email payloads ready for gateway dispatch.

**Request Body:**
```json
{
  "bookingRef": "HT-2026-8412",
  "customerName": "Neha R.",
  "customerPhone": "+9779801234567",
  "customerEmail": "neha@example.com",
  "date": "2026-12-10",
  "startTime": "14:00",
  "serviceNames": ["Private Couples Serenity Massage"],
  "totalNpr": 6800,
  "language": "en",
  "whatsappBusinessNumber": "+9779823945000"
}
```

**Response `200 OK`:**
```json
{
  "whatsappUrl": "https://wa.me/9779823945000?text=...",
  "smsPayload": {
    "to": "+9779801234567",
    "senderId": "HEALINGTOUCH",
    "body": "Healing Touch Birgunj: Ref HT-2026-8412 received for 2026-12-10 14:00. NPR 6800."
  },
  "emailPayload": {
    "to": "neha@example.com",
    "subject": "Appointment Request HT-2026-8412 — Healing Touch Spa & Saloon",
    "body": "Namaste Healing Touch Spa & Saloon! ..."
  }
}
```

---

## 5. RTK Query Service Endpoints (`src/store/api/endpoints.ts`)

| Hook / Category | Operations |
| :--- | :--- |
| **Catalog & Content** | `useGetSpaServicesQuery`, `useSaveSpaServiceMutation`, `useRemoveSpaServiceMutation`, `useGetSalonServicesQuery`, `useSaveSalonServiceMutation`, `useRemoveSalonServiceMutation`, `useGetCategoriesQuery`, `useSaveCategoryMutation`, `useRemoveCategoryMutation`, `useGetPackagesQuery`, `useSavePackageMutation`, `useRemovePackageMutation` |
| **Team & Suites** | `useGetStaffQuery`, `useSaveStaffMemberMutation`, `useRemoveStaffMemberMutation`, `useGetRoomsQuery`, `useSaveRoomMutation`, `useRemoveRoomMutation` |
| **Scheduling & Availability** | `useGetBookingSlotsByDateQuery` (live `onSnapshot`), `useFetchAvailabilityMutation` (`POST /api/availability`), `useCheckBookingConflictMutation` (`POST /api/bookings/check-conflict`), `useGetHolidaysQuery`, `useSaveHolidayMutation`, `useRemoveHolidayMutation` |
| **Bookings** | `useGetMyBookingsQuery`, `useGetAllBookingsQuery`, `useCreateBookingMutation` (atomic batch), `useUpdateBookingMutation` (conflict-checked), `useRemoveBookingMutation`, `useRescheduleOrCancelBookingMutation` |
| **Payments & CRM** | `useGetPaymentsQuery`, `useInitiateGatewayPaymentMutation`, `useVerifyGatewayPaymentMutation`, `useSavePaymentMutation`, `useGetCustomersQuery`, `useSaveCustomerMutation`, `useRemoveCustomerMutation` |
| **CMS, Reviews & Inquiries** | `useGetGalleryQuery`, `useSaveGalleryItemMutation`, `useRemoveGalleryItemMutation`, `useGetSocialPostsQuery`, `useSaveSocialPostMutation`, `useRemoveSocialPostMutation`, `useGetOffersQuery`, `useSaveOfferMutation`, `useRemoveOfferMutation`, `useGetBlogPostsQuery`, `useSaveBlogPostMutation`, `useRemoveBlogPostMutation`, `useGetReviewsQuery`, `useCreateReviewMutation`, `useModerateReviewMutation`, `useRemoveReviewMutation`, `useSendContactMessageMutation`, `useGetContactMessagesQuery`, `useUpdateContactMessageStatusMutation`, `useRemoveContactMessageMutation` |
| **Settings & Security** | `useGetBusinessSettingsQuery`, `useSaveBusinessSettingsMutation`, `useSeedDemoCatalogMutation`, `useGetAdminUsersQuery`, `useSaveAdminUserMutation`, `useRemoveAdminUserMutation`, `useGetAuditLogsQuery` |
