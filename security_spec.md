# Security Specification — Healing Touch Spa & Saloon

## 1. Data Invariants
1. **Default-Deny Safety Net**: Every unspecified path in `/databases/{database}/documents` is denied read and write access (`allow read, write: if false;`).
2. **PII Isolation**:
   - Customer bookings (`/bookings/{bookingId}`) contain `customerName`, `customerPhone`, and `customerEmail`. Public `list` or cross-user `get` on `/bookings` is strictly forbidden. Only the owning signed-in user (`resource.data.userId == request.auth.uid`) or a verified admin (`isAdmin()`) may read bookings.
   - Availability checking uses `/bookingSlots/{slotId}` which contains zero PII (`date`, `startTime`, `endTime`, `staffId`, `roomId`, `status`, `bookingId`) and strictly rejects any shadow PII keys via `hasOnly()`.
   - `/customers/{customerId}`, `/contactMessages/{messageId}`, and `/auditLogs/{logId}` are readable exclusively by verified admins (`isAdmin()`).
3. **Anti-Privilege-Escalation**:
   - `isAdmin()` checks `(request.auth.token.email == 'alamayub000@gmail.com' && request.auth.token.email_verified == true)` or an existing record in `/admins/{request.auth.uid}` with `active == true`.
   - Regular users writing `/users/{uid}` cannot assign admin roles or write arbitrary shadow keys.
4. **Booking State Integrity**:
   - Public booking creation (`create` on `/bookings/{bookingId}`) must set `status == 'pending'`, `paymentStatus == 'pending'`, `consentAccepted == true`, `agePolicyConfirmed == true`, and `createdAt == request.time`.
   - Signed-in owners may only reschedule or cancel (`status == 'cancelled'` or updating `date`, `startTime`, `endTime`, `updatedAt`) on non-terminal bookings (`existing().status in ['pending', 'confirmed']`) using strict `affectedKeys().hasOnly()`.
   - Terminal states (`completed`, `rejected`) cannot be altered by non-admins.
5. **Payment Verification Integrity**:
   - Non-admins cannot create or update `/payments/{paymentId}` with `status == 'verified'` or `verifiedByServer == true` unless verified via the server payment flow; only admins can mark refunds or cash settlements.

## 2. Dirty Dozen Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Shadow Admin Escalation**: Authenticated non-admin attempts to write `/admins/{uid}` with `{ role: 'super_admin', active: true }`.
2. **Spoofed Unverified Email**: User token with `email == 'alamayub000@gmail.com'` and `email_verified == false` attempts admin write on `/spaServices/svc1`.
3. **Blanket Booking Scrape**: Authenticated non-admin executes `list` on `/bookings` without `where('userId', '==', uid)` or attempts to read another user's `/bookings/{otherId}`.
4. **Booking Status Shortcutting**: Guest creates a `/bookings/{id}` with `status: 'confirmed'` and `paymentStatus: 'paid'`.
5. **Booking Slot PII Injection**: Client writes `/bookingSlots/{slotId}` with extra shadow key `customerPhone: '+9779800000000'`.
6. **ID Poisoning**: Client writes `/bookings/<1500-char-string>` violating `isValidId()`.
7. **Timestamp Forgery**: Client creates `/bookings/{id}` with `createdAt` in the past instead of `request.time`.
8. **Terminal State Tampering**: Owner attempts to revert a `completed` booking back to `pending`.
9. **Unauthorized Payment Verification**: Non-admin updates `/payments/{id}` setting `status: 'verified'`.
10. **Contact Message Read Leak**: Unauthenticated or non-admin user attempts `get` or `list` on `/contactMessages`.
11. **Customer CRM Leak**: Non-admin user attempts `list` on `/customers`.
12. **Review Auto-Publish Injection**: Non-admin creates `/reviews/{id}` with `published: true` instead of `published: false`.
