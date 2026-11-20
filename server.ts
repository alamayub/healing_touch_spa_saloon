import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// In-memory sandbox payment sessions (server-authoritative verification state)
interface SandboxPaymentSession {
  transactionId: string;
  bookingRef: string;
  method: 'esewa' | 'khalti' | 'fonepay' | 'cash';
  amountNpr: number;
  status: 'initiated' | 'verified' | 'failed';
  createdAt: string;
}

const paymentSessions = new Map<string, SandboxPaymentSession>();

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const staffShiftSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  shiftStart: z.string(),
  shiftEnd: z.string(),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
  workingDays: z.array(z.string()).optional(),
});

const roomCandidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  roomType: z.string().optional(),
  capacity: z.number().default(1),
  supportsCouple: z.boolean().default(false),
});

const existingSlotSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  staffId: z.string().optional(),
  roomId: z.string().optional(),
  status: z.string(),
});

const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.number().min(10).max(480),
  bufferMinutes: z.number().min(0).max(90).default(15),
  openTime: z.string().default('09:30'),
  closeTime: z.string().default('20:30'),
  staffId: z.string().optional(),
  roomId: z.string().optional(),
  isCouple: z.boolean().default(false),
  existingSlots: z.array(existingSlotSchema).default([]),
  staffShift: staffShiftSchema.optional(),
  eligibleStaff: z.array(staffShiftSchema.extend({ id: z.string(), name: z.string() })).default([]),
  eligibleRooms: z.array(roomCandidateSchema).default([]),
  holiday: z
    .object({
      name: z.string(),
      isClosed: z.boolean(),
      specialHours: z.string().optional(),
    })
    .optional(),
});

const checkConflictSchema = availabilitySchema.extend({
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

function getWeekdayName(dateIso: string): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [yr, mo, dy] = dateIso.split('-').map(Number);
  return dayNames[new Date(Date.UTC(yr, mo - 1, dy)).getUTCDay()];
}

function isStaffAvailableForWindow(
  staff: z.infer<typeof staffShiftSchema>,
  weekdayName: string,
  start: number,
  end: number,
  endWithBuffer: number,
  activeDaySlots: Array<z.infer<typeof existingSlotSchema>>,
  defaultExistingBuffer: number
): { ok: boolean; reason?: string } {
  if (staff.workingDays && staff.workingDays.length > 0 && !staff.workingDays.includes(weekdayName)) {
    return { ok: false, reason: `Off on ${weekdayName}` };
  }
  const sStart = timeToMinutes(staff.shiftStart);
  const sEnd = timeToMinutes(staff.shiftEnd);
  if (start < sStart || end > sEnd) {
    return { ok: false, reason: 'Outside shift hours' };
  }
  if (staff.breakStart && staff.breakEnd) {
    const bStart = timeToMinutes(staff.breakStart);
    const bEnd = timeToMinutes(staff.breakEnd);
    if (start < bEnd && end > bStart) {
      return { ok: false, reason: 'Specialist break' };
    }
  }
  for (const booked of activeDaySlots) {
    if (!staff.id || booked.staffId !== staff.id) continue;
    const bStart = timeToMinutes(booked.startTime);
    const bEndWithBuffer = timeToMinutes(booked.endTime) + defaultExistingBuffer;
    if (start < bEndWithBuffer && endWithBuffer > bStart) {
      const bEnd = timeToMinutes(booked.endTime);
      return {
        ok: false,
        reason: start >= bEnd ? 'Sanitization buffer' : 'Specialist booked',
      };
    }
  }
  return { ok: true };
}

function isRoomAvailableForWindow(
  roomId: string,
  start: number,
  endWithBuffer: number,
  activeDaySlots: Array<z.infer<typeof existingSlotSchema>>,
  defaultExistingBuffer: number
): { ok: boolean; reason?: string } {
  for (const booked of activeDaySlots) {
    if (booked.roomId !== roomId) continue;
    const bStart = timeToMinutes(booked.startTime);
    const bEnd = timeToMinutes(booked.endTime);
    const bEndWithBuffer = bEnd + defaultExistingBuffer;
    if (start < bEndWithBuffer && endWithBuffer > bStart) {
      return {
        ok: false,
        reason: start >= bEnd ? 'Suite cleaning buffer' : 'Suite reserved',
      };
    }
  }
  return { ok: true };
}

const initiatePaymentSchema = z.object({
  bookingRef: z.string().min(4).max(32),
  method: z.enum(['cash', 'esewa', 'khalti', 'fonepay']),
  amountNpr: z.number().min(0).max(500000),
  customerName: z.string().min(2).max(120),
});

const verifyPaymentSchema = z.object({
  transactionId: z.string().min(4).max(128),
  bookingRef: z.string().min(4).max(32),
  method: z.enum(['esewa', 'khalti', 'fonepay']),
  gatewayToken: z.string().min(4).max(256),
  simulateFailure: z.boolean().optional(),
});

const notificationComposeSchema = z.object({
  bookingRef: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string().optional(),
  date: z.string(),
  startTime: z.string(),
  serviceNames: z.array(z.string()),
  totalNpr: z.number(),
  language: z.enum(['en', 'ne']).default('en'),
  whatsappBusinessNumber: z.string().default('9779823945000'),
});

async function startServer() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', apiLimiter);

  // Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: 'Healing Touch Spa & Saloon API',
      timezone: 'Asia/Kathmandu',
      timestamp: new Date().toISOString(),
    });
  });

  // Availability & Conflict Engine
  app.post('/api/availability', (req: Request, res: Response) => {
    const parsed = availabilitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid availability request', issues: parsed.error.issues });
    }

    const {
      date,
      durationMinutes,
      bufferMinutes,
      openTime,
      closeTime,
      staffId,
      roomId,
      existingSlots,
      staffShift,
      eligibleStaff,
      eligibleRooms,
      holiday,
    } = parsed.data;

    if (holiday?.isClosed) {
      return res.json({
        date,
        closed: true,
        closedReason: `Closed for ${holiday.name}`,
        slots: [],
      });
    }

    const weekdayName = getWeekdayName(date);

    if (staffId && staffShift?.workingDays && !staffShift.workingDays.includes(weekdayName)) {
      return res.json({
        date,
        closed: false,
        staffUnavailableReason: `Selected professional is off on ${weekdayName}`,
        slots: [],
      });
    }

    let effOpen = openTime;
    let effClose = closeTime;
    if (holiday?.specialHours && /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(holiday.specialHours)) {
      const [hOpen, hClose] = holiday.specialHours.split('-').map((s) => s.trim());
      effOpen = hOpen;
      effClose = hClose;
    }

    const openMins = Math.max(
      timeToMinutes(effOpen),
      staffId && staffShift?.shiftStart ? timeToMinutes(staffShift.shiftStart) : 0
    );
    const closeMins = Math.min(
      timeToMinutes(effClose),
      staffId && staffShift?.shiftEnd ? timeToMinutes(staffShift.shiftEnd) : 24 * 60
    );

    const activeDaySlots = existingSlots.filter(
      (s) => s.date === date && s.status !== 'cancelled' && s.status !== 'rejected' && s.status !== 'no_show'
    );

    // Current Kathmandu time guard if booking for today
    const nowKtmDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    const nowKtmTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
    const nowKtmMins = nowKtmDate === date ? timeToMinutes(nowKtmTime) + 30 : -1;

    const slots: Array<{
      startTime: string;
      endTime: string;
      bufferEndTime: string;
      available: boolean;
      reason?: string;
      availableStaffIds: string[];
      availableRoomIds: string[];
    }> = [];
    const totalBlock = durationMinutes + bufferMinutes;
    const defaultExistingBuffer = Math.max(10, bufferMinutes);

    for (let start = openMins; start + durationMinutes <= closeMins; start += 30) {
      const end = start + durationMinutes;
      const endWithBuffer = start + totalBlock;
      let available = true;
      let reason: string | undefined;
      let availableStaffIds: string[] = [];
      let availableRoomIds: string[] = [];

      if (start < nowKtmMins) {
        available = false;
        reason = 'Past time';
      }

      if (available) {
        if (staffId && staffShift) {
          const check = isStaffAvailableForWindow(
            { ...staffShift, id: staffId },
            weekdayName,
            start,
            end,
            endWithBuffer,
            activeDaySlots,
            defaultExistingBuffer
          );
          if (!check.ok) {
            available = false;
            reason = check.reason;
          } else {
            availableStaffIds = [staffId];
          }
        } else if (eligibleStaff.length > 0) {
          availableStaffIds = eligibleStaff
            .filter(
              (st) =>
                isStaffAvailableForWindow(
                  st,
                  weekdayName,
                  start,
                  end,
                  endWithBuffer,
                  activeDaySlots,
                  defaultExistingBuffer
                ).ok
            )
            .map((st) => st.id);
          if (availableStaffIds.length === 0) {
            available = false;
            reason = 'All specialists booked';
          }
        }
      }

      if (available) {
        if (roomId) {
          const rCheck = isRoomAvailableForWindow(
            roomId,
            start,
            endWithBuffer,
            activeDaySlots,
            defaultExistingBuffer
          );
          if (!rCheck.ok) {
            available = false;
            reason = rCheck.reason;
          } else {
            availableRoomIds = [roomId];
          }
        } else if (eligibleRooms.length > 0) {
          availableRoomIds = eligibleRooms
            .filter(
              (rm) =>
                isRoomAvailableForWindow(
                  rm.id,
                  start,
                  endWithBuffer,
                  activeDaySlots,
                  defaultExistingBuffer
                ).ok
            )
            .map((rm) => rm.id);
          if (availableRoomIds.length === 0) {
            available = false;
            reason = 'All matching suites occupied';
          }
        }
      }

      slots.push({
        startTime: minutesToTime(start),
        endTime: minutesToTime(end),
        bufferEndTime: minutesToTime(endWithBuffer),
        available,
        reason,
        availableStaffIds,
        availableRoomIds,
      });
    }

    return res.json({ date, closed: false, slots });
  });

  // Pre-Commit Real-Time Appointment Conflict Verification & Resource Auto-Assignment
  app.post('/api/bookings/check-conflict', (req: Request, res: Response) => {
    const parsed = checkConflictSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ conflict: true, reason: 'Invalid conflict check payload' });
    }

    const {
      date,
      startTime,
      durationMinutes,
      bufferMinutes,
      staffId,
      roomId,
      existingSlots,
      staffShift,
      eligibleStaff,
      eligibleRooms,
      holiday,
    } = parsed.data;

    if (holiday?.isClosed) {
      return res.status(409).json({
        conflict: true,
        reason: `Healing Touch is closed on ${date} for ${holiday.name}.`,
      });
    }

    const weekdayName = getWeekdayName(date);
    const start = timeToMinutes(startTime);
    const end = start + durationMinutes;
    const endWithBuffer = start + durationMinutes + bufferMinutes;
    const defaultExistingBuffer = Math.max(10, bufferMinutes);

    const activeDaySlots = existingSlots.filter(
      (s) => s.date === date && s.status !== 'cancelled' && s.status !== 'rejected' && s.status !== 'no_show'
    );

    let assignedStaffId = staffId;
    let assignedStaffName = staffShift?.name;

    if (staffId && staffShift) {
      const check = isStaffAvailableForWindow(
        { ...staffShift, id: staffId },
        weekdayName,
        start,
        end,
        endWithBuffer,
        activeDaySlots,
        defaultExistingBuffer
      );
      if (!check.ok) {
        return res.status(409).json({
          conflict: true,
          reason: `Selected specialist is unavailable (${check.reason}). Please choose another time or specialist.`,
        });
      }
    } else if (eligibleStaff.length > 0) {
      const freeStaff = eligibleStaff.find(
        (st) =>
          isStaffAvailableForWindow(
            st,
            weekdayName,
            start,
            end,
            endWithBuffer,
            activeDaySlots,
            defaultExistingBuffer
          ).ok
      );
      if (!freeStaff) {
        return res.status(409).json({
          conflict: true,
          reason: 'No eligible specialist is available for this time window anymore. Please pick another slot.',
        });
      }
      assignedStaffId = freeStaff.id;
      assignedStaffName = freeStaff.name;
    }

    let assignedRoomId = roomId;
    let assignedRoomName: string | undefined;

    if (roomId) {
      const rCheck = isRoomAvailableForWindow(
        roomId,
        start,
        endWithBuffer,
        activeDaySlots,
        defaultExistingBuffer
      );
      if (!rCheck.ok) {
        return res.status(409).json({
          conflict: true,
          reason: `Selected suite is no longer available (${rCheck.reason}). Please select another slot or suite.`,
        });
      }
      assignedRoomName = eligibleRooms.find((r) => r.id === roomId)?.name;
    } else if (eligibleRooms.length > 0) {
      const freeRoom = eligibleRooms.find(
        (rm) =>
          isRoomAvailableForWindow(
            rm.id,
            start,
            endWithBuffer,
            activeDaySlots,
            defaultExistingBuffer
          ).ok
      );
      if (!freeRoom) {
        return res.status(409).json({
          conflict: true,
          reason: 'All suites matching your booking are now reserved during this window. Please pick another time.',
        });
      }
      assignedRoomId = freeRoom.id;
      assignedRoomName = freeRoom.name;
    }

    return res.json({
      conflict: false,
      assignedStaffId,
      assignedStaffName,
      assignedRoomId,
      assignedRoomName,
    });
  });

  // Nepal Payment Initiation (eSewa / Khalti / Fonepay / Cash)
  app.post('/api/payments/initiate', (req: Request, res: Response) => {
    const parsed = initiatePaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payment payload', issues: parsed.error.issues });
    }

    const { bookingRef, method, amountNpr, customerName } = parsed.data;
    const transactionId = `TXN-${method.toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    paymentSessions.set(transactionId, {
      transactionId,
      bookingRef,
      method,
      amountNpr,
      status: 'initiated',
      createdAt: new Date().toISOString(),
    });

    const signaturePayload = `${transactionId}|${bookingRef}|${amountNpr}`;
    const sandboxSignature = crypto
      .createHmac('sha256', process.env.PAYMENT_SANDBOX_SECRET || 'healing-touch-nepal-sandbox')
      .update(signaturePayload)
      .digest('hex')
      .slice(0, 16);

    return res.json({
      transactionId,
      bookingRef,
      method,
      amountNpr,
      currency: 'NPR',
      sandboxMode: true,
      gatewayToken: sandboxSignature,
      checkoutNote:
        method === 'cash'
          ? `Pay ${amountNpr} NPR at Healing Touch Reception Desk, Aadarsh Nagar, Birgunj.`
          : `Digital ${method.toUpperCase()} payment verification initiated for ${customerName}. Complete verification to confirm your appointment.`,
    });
  });

  // Server-Authoritative Payment Verification (never trusts client status blindly)
  app.post('/api/payments/verify', (req: Request, res: Response) => {
    const parsed = verifyPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid verification request', issues: parsed.error.issues });
    }

    const { transactionId, bookingRef, method, gatewayToken, simulateFailure } = parsed.data;
    const session = paymentSessions.get(transactionId);

    if (!session || session.bookingRef !== bookingRef || session.method !== method) {
      return res.status(404).json({ verified: false, error: 'Payment session not found or mismatched.' });
    }

    if (simulateFailure) {
      session.status = 'failed';
      return res.status(402).json({
        verified: false,
        status: 'failed',
        transactionId,
        error: 'Payment declined or cancelled by user.',
      });
    }

    const expectedSig = crypto
      .createHmac('sha256', process.env.PAYMENT_SANDBOX_SECRET || 'healing-touch-nepal-sandbox')
      .update(`${transactionId}|${bookingRef}|${session.amountNpr}`)
      .digest('hex')
      .slice(0, 16);

    if (gatewayToken !== expectedSig) {
      session.status = 'failed';
      return res.status(403).json({ verified: false, status: 'failed', error: 'Gateway signature mismatch.' });
    }

    session.status = 'verified';
    return res.json({
      verified: true,
      status: 'verified',
      transactionId,
      bookingRef,
      method,
      amountNpr: session.amountNpr,
      verifiedAt: new Date().toISOString(),
    });
  });

  // Notification & WhatsApp Link Composer (Email / SMS-ready architecture)
  app.post('/api/notifications/compose', (req: Request, res: Response) => {
    const parsed = notificationComposeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid notification payload' });
    }
    const data = parsed.data;
    const msg =
      data.language === 'ne'
        ? `नमस्ते Healing Touch Spa & Saloon! मेरो बुकिङ (${data.bookingRef}) मिति ${data.date}, समय ${data.startTime} बजे सेवा: ${data.serviceNames.join(', ')} (रु. ${data.totalNpr})। नाम: ${data.customerName}, फोन: ${data.customerPhone}`
        : `Namaste Healing Touch Spa & Saloon! Booking Ref: ${data.bookingRef} on ${data.date} at ${data.startTime}. Services: ${data.serviceNames.join(', ')} (NPR ${data.totalNpr}). Guest: ${data.customerName} (${data.customerPhone}).`;

    const digits = data.whatsappBusinessNumber.replace(/[^0-9]/g, '');
    const waDigits = digits.startsWith('977') ? digits : `977${digits}`;

    return res.json({
      whatsappUrl: `https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`,
      smsPayload: {
        to: data.customerPhone,
        senderId: 'HEALINGTOUCH',
        body: `Healing Touch Birgunj: Ref ${data.bookingRef} received for ${data.date} ${data.startTime}. NPR ${data.totalNpr}.`,
      },
      emailPayload: data.customerEmail
        ? {
            to: data.customerEmail,
            subject: `Appointment Request ${data.bookingRef} — Healing Touch Spa & Saloon`,
            body: msg,
          }
        : null,
    });
  });

  // SEO: robots.txt & sitemap.xml
  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.type('text/plain').send(
      ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Sitemap: /sitemap.xml'].join('\n')
    );
  });

  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const origin = `${req.protocol}://${req.get('host')}`;
    const routes = [
      '/',
      '/spa',
      '/salon',
      '/packages',
      '/experience',
      '/about',
      '/team',
      '/gallery',
      '/booking',
      '/contact',
      '/social',
      '/offers',
      '/blog',
      '/reviews',
      '/faq',
      '/privacy-policy',
      '/terms',
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
      .map((r) => `  <url><loc>${origin}${r}</loc><changefreq>weekly</changefreq></url>`)
      .join('\n')}\n</urlset>`;
    res.type('application/xml').send(xml);
  });

  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const hmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: hmrDisabled ? false : { server: httpServer },
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Healing Touch Spa & Saloon server listening on http://localhost:${PORT}`);
  });
}

startServer();
