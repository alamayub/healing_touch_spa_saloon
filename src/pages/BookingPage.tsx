import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  CreditCard,
  DoorOpen,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import {
  useCheckAvailabilityMutation,
  useCheckBookingConflictMutation,
  useComposeNotificationMutation,
  useCreateBookingMutation,
  useGetBookingSlotsByDateQuery,
  useGetBusinessSettingsQuery,
  useGetHolidaysQuery,
  useGetPackagesQuery,
  useGetRoomsQuery,
  useGetSalonServicesQuery,
  useGetSpaServicesQuery,
  useGetStaffQuery,
  useInitiateNepalPaymentMutation,
  useSavePaymentRecordMutation,
  useVerifyNepalPaymentMutation,
} from '../store/api/endpoints.ts';
import { useAppDispatch, useAppSelector } from '../store/index.ts';
import { addSessionBookingRef, clearBookingDraft } from '../store/slices/uiSlice.ts';
import { Booking, BookingCategory, PaymentMethod, PaymentStatus } from '../types/domain.ts';
import { toBikramSambat } from '../utils/bikramSambat.ts';
import {
  formatDisplayTime,
  formatDuration,
  formatNpr,
  generateBookingRef,
  getKathmanduTodayIso,
  isValidNepalPhone,
} from '../utils/nepal.ts';

const customerSchema = z.object({
  customerName: z.string().min(2, 'Please enter your full name').max(120),
  customerPhone: z
    .string()
    .refine(isValidNepalPhone, 'Enter a valid Nepal phone number (e.g. +977 982-3945000)'),
  customerEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
  preferredLanguage: z.enum(['en', 'ne']),
  notes: z.string().max(600).optional(),
  comfortPreferences: z.string().max(400).optional(),
  consentAccepted: z.boolean().refine((val) => val === true, {
    message: 'Please confirm treatment description & privacy consent',
  }),
  agePolicyConfirmed: z.boolean().refine((val) => val === true, {
    message: 'Please confirm you meet the age policy requirement',
  }),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const STEPS = [
  'Category',
  'Services',
  'Specialist',
  'Date',
  'Time',
  'Details',
  'Review & Pay',
  'Confirmed',
];

const ROOM_TYPE_LABELS: Record<string, string> = {
  single_suite: 'Private Single Suite',
  couple_suite: 'Couples Sanctuary Suite',
  hydro_suite: 'Hydrotherapy & Jacuzzi Suite',
  reflexology_lounge: 'Reflexology Lounge',
  salon_studio: 'Unisex Salon Studio',
  bridal_suite: 'Bridal Styling Suite',
};

export const BookingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.ui.bookingDraft);
  const lang = useAppSelector((s) => s.ui.language);
  const authUser = useAppSelector((s) => s.ui.user);
  const isAdminUser = useAppSelector((s) => s.ui.isAdmin);

  const { data: settings } = useGetBusinessSettingsQuery();
  const { data: spaServices = [] } = useGetSpaServicesQuery(false);
  const { data: salonServices = [] } = useGetSalonServicesQuery(false);
  const { data: packages = [] } = useGetPackagesQuery(false);
  const { data: staff = [] } = useGetStaffQuery(false);
  const { data: rooms = [] } = useGetRoomsQuery(false);
  const { data: holidays = [] } = useGetHolidaysQuery();

  const [step, setStep] = useState<number>(draft.serviceIds?.length ? 3 : 1);
  const [category, setCategory] = useState<BookingCategory>(draft.category || 'spa');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(draft.serviceIds || []);
  const [isCouple, setIsCouple] = useState<boolean>(Boolean(draft.isCouple));
  const [selectedStaffId, setSelectedStaffId] = useState<string>(draft.staffId || '');
  const [partnerStaffId, setPartnerStaffId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getKathmanduTodayIso());
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: string;
    endTime: string;
    bufferEndTime?: string;
    availableStaffIds?: string[];
    availableRoomIds?: string[];
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [gatewaySession, setGatewaySession] = useState<{
    transactionId: string;
    gatewayToken: string;
    checkoutNote: string;
  } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conflictAlert, setConflictAlert] = useState<string | null>(null);

  // Real-time Firestore onSnapshot listener on bookingSlots for selectedDate
  const {
    data: daySlots = [],
    isFetching: refreshingLiveSlots,
    refetch: refetchDaySlots,
  } = useGetBookingSlotsByDateQuery(selectedDate);

  const [checkAvailability, { data: availabilityData, isLoading: checkingSlots }] =
    useCheckAvailabilityMutation();
  const [checkBookingConflict, { isLoading: verifyingConflict }] =
    useCheckBookingConflictMutation();
  const [createBooking, { isLoading: savingBooking }] = useCreateBookingMutation();
  const [initiatePayment, { isLoading: initiatingPay }] = useInitiateNepalPaymentMutation();
  const [verifyPayment, { isLoading: verifyingPay }] = useVerifyNepalPaymentMutation();
  const [savePaymentRecord] = useSavePaymentRecordMutation();
  const [composeNotification] = useComposeNotificationMutation();

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    reset: resetForm,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: authUser?.displayName || '',
      customerPhone: '',
      customerEmail: authUser?.email || '',
      preferredLanguage: lang,
      notes: '',
      comfortPreferences: '',
    },
  });

  useEffect(() => {
    return () => {
      dispatch(clearBookingDraft());
    };
  }, [dispatch]);

  const selectedItems = useMemo(() => {
    if (category === 'spa') {
      return spaServices.filter((s) => selectedServiceIds.includes(s.id));
    }
    if (category === 'salon') {
      return salonServices.filter((s) => selectedServiceIds.includes(s.id));
    }
    return packages.filter((p) => selectedServiceIds.includes(p.id));
  }, [category, spaServices, salonServices, packages, selectedServiceIds]);

  const requiredRoomType = useMemo(() => {
    if (category === 'spa') {
      const selectedSpa = spaServices.filter((s) => selectedServiceIds.includes(s.id));
      if (selectedSpa.some((s) => s.roomTypeRequired === 'hydro_suite')) return 'hydro_suite';
      if (isCouple) return 'couple_suite';
      return selectedSpa[0]?.roomTypeRequired || 'any';
    }
    if (category === 'package' && isCouple) return 'couple_suite';
    if (category === 'salon') return 'salon_studio';
    return 'any';
  }, [category, selectedServiceIds, spaServices, isCouple]);

  const summary = useMemo(() => {
    let duration = 0;
    let buffer = 15;
    let total = 0;
    const names: string[] = [];

    if (category === 'spa') {
      spaServices
        .filter((s) => selectedServiceIds.includes(s.id))
        .forEach((s) => {
          duration += s.durationMinutes;
          buffer = Math.max(buffer, s.bufferMinutes || 15);
          total += isCouple && s.couplePriceNpr ? s.couplePriceNpr : isCouple ? s.priceNpr * 2 : s.priceNpr;
          names.push(s.name);
        });
    } else if (category === 'salon') {
      salonServices
        .filter((s) => selectedServiceIds.includes(s.id))
        .forEach((s) => {
          duration += s.durationMinutes;
          buffer = Math.max(buffer, s.bufferMinutes || 10);
          total += s.priceNpr;
          names.push(s.name);
        });
    } else {
      packages
        .filter((p) => selectedServiceIds.includes(p.id))
        .forEach((p) => {
          duration += p.totalDurationMinutes;
          buffer = 20;
          total += p.packagePriceNpr;
          names.push(p.name);
        });
    }

    return {
      duration: duration || 60,
      buffer,
      total,
      names,
    };
  }, [category, selectedServiceIds, spaServices, salonServices, packages, isCouple]);

  const eligibleStaff = useMemo(() => {
    return staff.filter((m) => {
      if (!m.availableForBooking) return false;
      if (category === 'spa') return m.division === 'spa' || m.division === 'both';
      if (category === 'salon') return m.division === 'salon' || m.division === 'both';
      return true;
    });
  }, [staff, category]);

  const eligibleRooms = useMemo(() => {
    const activeRooms = rooms.filter((r) => r.status === 'available');
    if (isCouple) {
      const coupleCapable = activeRooms.filter((r) => r.supportsCouple && r.capacity >= 2);
      if (requiredRoomType === 'hydro_suite') {
        const hydro = coupleCapable.filter((r) => r.roomType === 'hydro_suite');
        if (hydro.length > 0) return hydro;
      }
      return coupleCapable;
    }
    if (category === 'salon') {
      return activeRooms.filter(
        (r) => r.roomType === 'salon_studio' || r.roomType === 'bridal_suite'
      );
    }
    const nonSalon = activeRooms.filter((r) => r.roomType !== 'salon_studio');
    if (requiredRoomType !== 'any') {
      const exact = nonSalon.filter((r) => r.roomType === requiredRoomType);
      if (exact.length > 0) return exact;
    }
    return nonSalon;
  }, [rooms, isCouple, category, requiredRoomType]);

  // Clear invalid room selection if user toggles couples or changes services
  useEffect(() => {
    if (selectedRoomId && !eligibleRooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId('');
    }
  }, [eligibleRooms, selectedRoomId]);

  const activeHoliday = useMemo(
    () => holidays.find((h) => h.date === selectedDate),
    [holidays, selectedDate]
  );

  const staffBookedCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    daySlots
      .filter((s) => s.status !== 'cancelled' && s.status !== 'rejected' && s.status !== 'no_show')
      .forEach((s) => {
        if (s.staffId) map.set(s.staffId, (map.get(s.staffId) || 0) + 1);
      });
    return map;
  }, [daySlots]);

  const roomBookedCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    daySlots
      .filter((s) => s.status !== 'cancelled' && s.status !== 'rejected' && s.status !== 'no_show')
      .forEach((s) => {
        if (s.roomId) map.set(s.roomId, (map.get(s.roomId) || 0) + 1);
      });
    return map;
  }, [daySlots]);

  const buildAvailabilityPayload = () => {
    const chosenStaff = eligibleStaff.find((m) => m.id === selectedStaffId);
    const chosenRoom = eligibleRooms.find((r) => r.id === selectedRoomId);
    return {
      date: selectedDate,
      durationMinutes: summary.duration,
      bufferMinutes: summary.buffer,
      openTime: settings?.openTime || '09:30',
      closeTime: settings?.closeTime || '20:30',
      staffId: chosenStaff?.id,
      roomId: chosenRoom?.id,
      isCouple,
      existingSlots: daySlots,
      staffShift: chosenStaff
        ? {
            id: chosenStaff.id,
            name: chosenStaff.name,
            shiftStart: chosenStaff.shiftStart,
            shiftEnd: chosenStaff.shiftEnd,
            breakStart: chosenStaff.breakStart,
            breakEnd: chosenStaff.breakEnd,
            workingDays: chosenStaff.workingDays,
          }
        : undefined,
      eligibleStaff: eligibleStaff.map((m) => ({
        id: m.id,
        name: m.name,
        shiftStart: m.shiftStart,
        shiftEnd: m.shiftEnd,
        breakStart: m.breakStart,
        breakEnd: m.breakEnd,
        workingDays: m.workingDays,
      })),
      eligibleRooms: eligibleRooms.map((r) => ({
        id: r.id,
        name: r.name,
        roomType: r.roomType,
        capacity: r.capacity,
        supportsCouple: r.supportsCouple,
      })),
      holiday: activeHoliday
        ? {
            name: activeHoliday.name,
            isClosed: activeHoliday.isClosed,
            specialHours: activeHoliday.specialHours,
          }
        : undefined,
    };
  };

  useEffect(() => {
    if (step !== 5) return;
    checkAvailability(buildAvailabilityPayload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    step,
    selectedDate,
    summary.duration,
    summary.buffer,
    selectedStaffId,
    selectedRoomId,
    isCouple,
    daySlots,
    eligibleStaff,
    eligibleRooms,
    settings,
    activeHoliday,
  ]);

  // If the selected slot disappears in real-time because someone else booked it, warn the guest immediately
  useEffect(() => {
    if (!selectedSlot || !availabilityData?.slots) return;
    const match = availabilityData.slots.find((s) => s.startTime === selectedSlot.startTime);
    if (match && !match.available) {
      setSelectedSlot(null);
      setConflictAlert(
        `The ${formatDisplayTime(selectedSlot.startTime)} slot was just reserved (${match.reason || 'conflict'}). Please choose another available time.`
      );
      if (step > 5 && step < 8) setStep(5);
    }
  }, [availabilityData, selectedSlot, step]);

  const toggleService = (id: string) => {
    if (category === 'salon') {
      setSelectedServiceIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedServiceIds([id]);
    }
    setSelectedSlot(null);
    setConflictAlert(null);
  };

  const handleNextFromStep = async (currentStep: number) => {
    if (currentStep === 2 && selectedServiceIds.length === 0) return;
    if (currentStep === 5 && !selectedSlot) return;
    if (currentStep === 6) {
      const valid = await trigger();
      if (!valid) return;
    }
    setStep((s) => Math.min(8, s + 1));
  };

  const [bookingNonce, setBookingNonce] = useState(0);
  const pendingBookingRef = useMemo(() => generateBookingRef(), [bookingNonce]);

  const handleStartSandboxPayment = async () => {
    if (paymentMethod === 'cash') return;
    setPaymentError(null);
    const values = getValues();
    try {
      const res = await initiatePayment({
        bookingRef: pendingBookingRef,
        method: paymentMethod,
        amountNpr: summary.total,
        customerName: values.customerName || 'Guest',
      }).unwrap();
      setGatewaySession({
        transactionId: res.transactionId,
        gatewayToken: res.gatewayToken,
        checkoutNote: res.checkoutNote,
      });
    } catch {
      setPaymentError('Unable to reach payment verification server. You may choose Pay at Desk.');
    }
  };

  const handleVerifySandboxPayment = async (simulateFailure = false) => {
    if (!gatewaySession || paymentMethod === 'cash') return;
    setPaymentError(null);
    try {
      const res = await verifyPayment({
        transactionId: gatewaySession.transactionId,
        bookingRef: pendingBookingRef,
        method: paymentMethod,
        gatewayToken: gatewaySession.gatewayToken,
        simulateFailure,
      }).unwrap();
      if (res.verified) {
        setPaymentStatus('paid');
      } else {
        setPaymentStatus('failed');
        setPaymentError('Payment verification was declined.');
      }
    } catch {
      setPaymentStatus('failed');
      setPaymentError('Sandbox gateway verification failed. Online payment was not marked paid.');
    }
  };

  const onConfirmBooking = handleSubmit(async (values) => {
    if (!selectedSlot) return;
    if (paymentMethod !== 'cash' && paymentStatus !== 'paid') {
      setSubmitError('Please complete online payment verification or select Pay at Desk (Cash).');
      return;
    }

    setSubmitError(null);
    setConflictAlert(null);

    try {
      // 1. Pre-commit real-time backend conflict check + conflict-free specialist & suite resolution
      const conflictRes = await checkBookingConflict({
        ...buildAvailabilityPayload(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      }).unwrap();

      if (conflictRes.conflict) {
        const msg =
          conflictRes.reason ||
          'This time window is no longer available. Please choose another time slot.';
        setConflictAlert(msg);
        setSubmitError(msg);
        setSelectedSlot(null);
        await refetchDaySlots();
        return;
      }

      const chosenStaff =
        eligibleStaff.find((m) => m.id === (conflictRes.assignedStaffId || selectedStaffId)) ||
        eligibleStaff[0];
      const chosenRoom =
        eligibleRooms.find((r) => r.id === (conflictRes.assignedRoomId || selectedRoomId)) ||
        eligibleRooms[0];
      const partnerStaff = isCouple
        ? eligibleStaff.find((m) => m.id === partnerStaffId)
        : undefined;

      const comfortCombined = [
        values.comfortPreferences?.trim(),
        isCouple && partnerStaff ? `Couples Companion Therapist Requested: ${partnerStaff.name}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const bookingId = `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const payload: Omit<Booking, 'createdAt' | 'updatedAt'> = {
        id: bookingId,
        bookingRef: pendingBookingRef,
        userId: authUser?.uid,
        category,
        serviceIds: selectedServiceIds,
        serviceNames: summary.names,
        isCouple,
        guestCount: isCouple ? 2 : 1,
        staffId: chosenStaff?.id,
        staffName: chosenStaff?.name || conflictRes.assignedStaffName || 'Assigned at Reception',
        roomId: chosenRoom?.id,
        roomName: chosenRoom?.name || conflictRes.assignedRoomName || 'Assigned at Reception',
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        durationMinutes: summary.duration,
        bufferMinutes: summary.buffer,
        totalNpr: summary.total,
        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),
        customerEmail: values.customerEmail?.trim() || undefined,
        preferredLanguage: values.preferredLanguage,
        notes: values.notes?.trim() || undefined,
        comfortPreferences: comfortCombined || undefined,
        consentAccepted: true,
        agePolicyConfirmed: true,
        status: 'pending',
        paymentMethod,
        paymentStatus: 'pending',
      };

      // 2. Atomic Firestore write with live slot collision re-verification
      const created = await createBooking({
        booking: payload,
        options: {
          candidateStaff: eligibleStaff.map((s) => ({ id: s.id, name: s.name })),
          candidateRooms: eligibleRooms.map((r) => ({ id: r.id, name: r.name })),
        },
      }).unwrap();

      // 3. Payment ledger entry (adhering strictly to firestore.rules verifiedByServer gate for guests)
      await savePaymentRecord({
        id: `pay-${bookingId}`,
        bookingId,
        bookingRef: pendingBookingRef,
        userId: authUser?.uid,
        method: paymentMethod,
        amountNpr: summary.total,
        isAdvance: false,
        status: 'pending',
        gatewayRef: gatewaySession?.transactionId,
        verifiedByServer: isAdminUser ? paymentMethod !== 'cash' && paymentStatus === 'paid' : false,
      });

      const notif = await composeNotification({
        bookingRef: created.bookingRef,
        customerName: created.customerName,
        customerPhone: created.customerPhone,
        customerEmail: created.customerEmail,
        date: created.date,
        startTime: created.startTime,
        serviceNames: created.serviceNames,
        totalNpr: created.totalNpr,
        language: created.preferredLanguage,
        whatsappBusinessNumber: settings?.whatsappNumber || '+9779823945000',
      }).unwrap();

      setWhatsappLink(notif.whatsappUrl);
      setConfirmedBooking(created);
      dispatch(addSessionBookingRef(created.bookingRef));
      setStep(8);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'data' in err
          ? String((err as { data?: { reason?: string } }).data?.reason || '')
          : typeof err === 'object' && err !== null && 'error' in err
          ? String((err as { error?: string }).error || '')
          : err instanceof Error
          ? err.message
          : '';

      if (message.includes('BOOKING_CONFLICT') || message.includes('unavailable') || message.includes('reserved')) {
        const cleanMsg = message.replace('BOOKING_CONFLICT:', '').trim();
        setConflictAlert(cleanMsg || 'Another guest just booked this exact time window. Please select another slot.');
        setSubmitError(cleanMsg || 'Scheduling conflict detected. Please select an open slot.');
        setSelectedSlot(null);
        await refetchDaySlots();
      } else {
        setSubmitError('Could not save appointment. Please verify your details and try again.');
      }
    }
  });

  const handleBookAnother = () => {
    setBookingNonce((n) => n + 1);
    setConfirmedBooking(null);
    setSelectedServiceIds([]);
    setSelectedStaffId('');
    setPartnerStaffId('');
    setSelectedRoomId('');
    setSelectedSlot(null);
    setPaymentMethod('cash');
    setPaymentStatus('pending');
    setGatewaySession(null);
    setPaymentError(null);
    setSubmitError(null);
    setConflictAlert(null);
    resetForm({
      customerName: authUser?.displayName || '',
      customerPhone: '',
      customerEmail: authUser?.email || '',
      preferredLanguage: lang,
      notes: '',
      comfortPreferences: '',
    });
    setStep(1);
  };

  const bsSelectedDate = toBikramSambat(selectedDate);
  const selectedStaffObj = eligibleStaff.find((m) => m.id === selectedStaffId);
  const selectedRoomObj = eligibleRooms.find((r) => r.id === selectedRoomId);

  return (
    <PublicLayout>
      <SeoHead
        title="Book Your Appointment"
        description="Reserve single or couples spa suites, unisex salon appointments, and curated packages in Aadarsh Nagar, Birgunj."
        image="/images/spa_couple.jpg"
      />

      <section className="resort-grain border-b border-[#183D35]/12 bg-[#183D35] py-14 text-[#FBF9F5]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#C4A36A]">
            Spa &amp; Salon Booking Desk
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">
            Reserve Your Experience
          </h1>

          {/* 8-Step Progress Indicator */}
          <div className="mt-7 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {STEPS.map((label, idx) => {
              const num = idx + 1;
              const isCurrent = step === num;
              const isDone = step > num;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={step === 8 || num > step}
                  onClick={() => {
                    if (num < step && step < 8) setStep(num);
                  }}
                  className={`border-t-2 pt-2.5 text-left text-[11px] transition-colors ${
                    isCurrent
                      ? 'border-[#C4A36A] font-semibold text-[#FBF9F5]'
                      : isDone
                      ? 'border-[#C4A36A]/60 text-[#F6F0E7]/85 hover:text-white cursor-pointer'
                      : 'border-[#F6F0E7]/20 text-[#F6F0E7]/50 cursor-default'
                  }`}
                >
                  <span className="font-mono tabular-nums">{String(num).padStart(2, '0')}</span>{' '}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {conflictAlert && (
          <div className="mb-6 flex items-start justify-between gap-4 border border-amber-400 bg-amber-50 p-4 text-xs text-amber-950">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div>
                <p className="font-semibold">Live Schedule Update</p>
                <p className="mt-0.5">{conflictAlert}</p>
              </div>
            </div>
            {step !== 5 && step < 8 && (
              <button
                type="button"
                onClick={() => setStep(5)}
                className="shrink-0 bg-[#183D35] px-3 py-1.5 text-[11px] font-semibold text-[#FBF9F5]"
              >
                Pick Open Time
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Step Panel */}
          <div className="lg:col-span-8">
            {/* STEP 1: CATEGORY & GUEST MODE */}
            {step === 1 && (
              <div className="space-y-8 border border-[#183D35]/15 bg-[#FBF9F5] p-6 sm:p-8">
                <div>
                  <h2 className="font-display text-3xl font-medium text-[#183D35]">
                    1. Choose Experience Category
                  </h2>
                  <p className="mt-1 text-sm text-[#858078]">
                    Select between private spa suites, unisex salon care, or combined packages.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {(
                    [
                      {
                        id: 'spa',
                        title: 'Spa & Hydrotherapy',
                        desc: 'Massages, steam bath, jacuzzi & reflexology',
                      },
                      {
                        id: 'salon',
                        title: 'Unisex Salon',
                        desc: 'Haircuts, keratin, facials, bridal & nails',
                      },
                      {
                        id: 'package',
                        title: 'Packages',
                        desc: 'Curated multi-service spa & salon rituals',
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCategory(item.id);
                        setSelectedServiceIds([]);
                        setSelectedStaffId('');
                        setPartnerStaffId('');
                        setSelectedRoomId('');
                        setSelectedSlot(null);
                        if (item.id === 'salon') setIsCouple(false);
                      }}
                      className={`border p-5 text-left transition-colors ${
                        category === item.id
                          ? 'border-[#183D35] bg-[#183D35] text-[#FBF9F5]'
                          : 'border-[#183D35]/15 bg-[#F6F0E7]/40 text-[#252525] hover:border-[#183D35]'
                      }`}
                    >
                      <p className="font-display text-xl font-medium">{item.title}</p>
                      <p
                        className={`mt-1 text-xs ${
                          category === item.id ? 'text-[#F6F0E7]/85' : 'text-[#858078]'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {category !== 'salon' && (
                  <div className="border-t border-[#183D35]/10 pt-6">
                    <p className="text-sm font-semibold text-[#183D35]">Session Occupancy</p>
                    <p className="mt-0.5 text-xs text-[#858078]">
                      Couples bookings automatically allocate a 2-guest suite with dedicated sanitization buffer.
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCouple(false);
                          setPartnerStaffId('');
                        }}
                        className={`flex items-center gap-3 border p-4 text-left ${
                          !isCouple
                            ? 'border-[#183D35] bg-[#F6F0E7] text-[#183D35]'
                            : 'border-[#183D35]/15 bg-white text-[#252525]'
                        }`}
                      >
                        <User className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Single Guest</p>
                          <p className="text-xs text-[#858078]">Private single treatment suite</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCouple(true)}
                        className={`flex items-center gap-3 border p-4 text-left ${
                          isCouple
                            ? 'border-[#183D35] bg-[#F6F0E7] text-[#183D35]'
                            : 'border-[#183D35]/15 bg-white text-[#252525]'
                        }`}
                      >
                        <Users className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Couples Experience (2 Guests)</p>
                          <p className="text-xs text-[#858078]">Dedicated couples or hydro suite</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-sm bg-[#183D35] px-6 py-3 text-xs font-semibold text-[#FBF9F5] hover:bg-[#112C26]"
                  >
                    Continue to Services <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT SERVICES */}
            {step === 2 && (
              <div className="space-y-6 border border-[#183D35]/15 bg-[#FBF9F5] p-6 sm:p-8">
                <div>
                  <h2 className="font-display text-3xl font-medium text-[#183D35]">
                    2. Select {category === 'spa' ? 'Treatment' : category === 'salon' ? 'Salon Services' : 'Package'}
                  </h2>
                  <p className="mt-1 text-sm text-[#858078]">
                    {category === 'salon'
                      ? 'You may select multiple salon services to combine into one visit.'
                      : 'Duration and cleaning buffer times are applied automatically to prevent overlapping bookings.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {category === 'spa' &&
                    spaServices
                      .filter((s) => !isCouple || s.supportsCouple)
                      .map((s) => {
                        const checked = selectedServiceIds.includes(s.id);
                        const price =
                          isCouple && s.couplePriceNpr
                            ? s.couplePriceNpr
                            : isCouple
                            ? s.priceNpr * 2
                            : s.priceNpr;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleService(s.id)}
                            className={`flex w-full items-start justify-between gap-4 border p-4 text-left transition-colors ${
                              checked
                                ? 'border-[#183D35] bg-[#F6F0E7]'
                                : 'border-[#183D35]/12 bg-white hover:border-[#183D35]/40'
                            }`}
                          >
                            <div>
                              <p className="text-xs text-[#858078]">
                                {s.category} · {formatDuration(s.durationMinutes, lang)} · +{s.bufferMinutes || 15}m hygiene buffer
                              </p>
                              <p className="mt-0.5 font-display text-xl font-medium text-[#183D35]">
                                {s.name}
                              </p>
                              <p className="mt-1 text-xs text-[#252525]/80">{s.description}</p>
                            </div>
                            <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-[#183D35]">
                              {formatNpr(price, lang)}
                            </span>
                          </button>
                        );
                      })}

                  {category === 'salon' &&
                    salonServices.map((s) => {
                      const checked = selectedServiceIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleService(s.id)}
                          className={`flex w-full items-start justify-between gap-4 border p-4 text-left transition-colors ${
                            checked
                              ? 'border-[#183D35] bg-[#F6F0E7]'
                              : 'border-[#183D35]/12 bg-white hover:border-[#183D35]/40'
                          }`}
                        >
                          <div>
                            <p className="text-xs text-[#858078] capitalize">
                              {s.audience} · {s.category} · {formatDuration(s.durationMinutes, lang)}
                            </p>
                            <p className="mt-0.5 font-display text-xl font-medium text-[#183D35]">
                              {s.name}
                            </p>
                            <p className="mt-1 text-xs text-[#252525]/80">{s.description}</p>
                          </div>
                          <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-[#183D35]">
                            {formatNpr(s.priceNpr, lang)}
                          </span>
                        </button>
                      );
                    })}

                  {category === 'package' &&
                    packages.map((p) => {
                      const checked = selectedServiceIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            toggleService(p.id);
                            setIsCouple(p.supportsCouple);
                          }}
                          className={`flex w-full items-start justify-between gap-4 border p-4 text-left transition-colors ${
                            checked
                              ? 'border-[#183D35] bg-[#F6F0E7]'
                              : 'border-[#183D35]/12 bg-white hover:border-[#183D35]/40'
                          }`}
                        >
                          <div>
                            <p className="text-xs text-[#858078]">
                              {p.category} · {formatDuration(p.totalDurationMinutes, lang)} ·{' '}
                              {p.supportsCouple ? 'For Two (Couples Suite)' : 'Single Guest'}
                            </p>
                            <p className="mt-0.5 font-display text-xl font-medium text-[#183D35]">
                              {p.name}
                            </p>
                            <p className="mt-1 text-xs text-[#252525]/80">
                              Includes: {p.includedServiceNames.join(' · ')}
                            </p>
                          </div>
                          <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-[#183D35]">
                            {formatNpr(p.packagePriceNpr, lang)}
                          </span>
                        </button>
                      );
                    })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#183D35]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    disabled={selectedServiceIds.length === 0}
                    onClick={() => handleNextFromStep(2)}
                    className="inline-flex items-center gap-2 rounded-sm bg-[#183D35] px-6 py-3 text-xs font-semibold text-[#FBF9F5] hover:bg-[#112C26] disabled:opacity-40"
                  >
                    Choose Specialist &amp; Suite <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: STAFF & SUITE PREFERENCE */}
            {step === 3 && (
              <div className="space-y-8 border border-[#183D35]/15 bg-[#FBF9F5] p-6 sm:p-8">
                <div>
                  <h2 className="font-display text-3xl font-medium text-[#183D35]">
                    3. Select Specialist &amp; Suite Allocation
                  </h2>
                  <p className="mt-1 text-sm text-[#858078]">
                    Pick a preferred professional and treatment suite, or allow our real-time scheduler to auto-assign an open specialist and room.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStaffId('');
                      setSelectedSlot(null);
                    }}
                    className={`flex w-full items-center justify-between border p-4 text-left ${
                      selectedStaffId === ''
                        ? 'border-[#183D35] bg-[#F6F0E7]'
                        : 'border-[#183D35]/12 bg-white'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-[#183D35]">Any Available Specialist</p>
                      <p className="text-xs text-[#858078]">
                        Maximizes open time slots ({eligibleStaff.length} eligible specialists)
                      </p>
                    </div>
                    {selectedStaffId === '' && <Check className="h-4 w-4 text-[#183D35]" />}
                  </button>

                  {eligibleStaff.map((m) => {
                    const dayCount = staffBookedCountByDate.get(m.id) || 0;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedStaffId(m.id);
                          setSelectedSlot(null);
                        }}
                        className={`flex w-full items-center justify-between gap-3 border p-4 text-left ${
                          selectedStaffId === m.id
                            ? 'border-[#183D35] bg-[#F6F0E7]'
                            : 'border-[#183D35]/12 bg-white hover:border-[#183D35]/40'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-[#183D35]">{m.name}</p>
                          <p className="text-xs text-[#858078]">
                            {m.designation} · Shift {m.shiftStart}–{m.shiftEnd}
                            {m.breakStart && m.breakEnd ? ` (Break ${m.breakStart}–${m.breakEnd})` : ''}
                          </p>
                          <p className="mt-1 text-[11px] text-[#858078]">
                            Days: {m.workingDays.join(', ')} · {dayCount} scheduled on {selectedDate}
                          </p>
                        </div>
                        {selectedStaffId === m.id && <Check className="h-4 w-4 shrink-0 text-[#183D35]" />}
                      </button>
                    );
                  })}
                </div>

                {isCouple && eligibleStaff.length > 1 && (
                  <div className="border-t border-[#183D35]/10 pt-5">
                    <label className="block text-xs font-semibold text-[#183D35]">
                      Partner Companion Therapist Preference (For Synchronized Couples Session)
                    </label>
                    <p className="mt-0.5 text-[11px] text-[#858078]">
                      Optional preference for the second therapist in your couples room.
                    </p>
                    <select
                      value={partnerStaffId}
                      onChange={(e) => setPartnerStaffId(e.target.value)}
                      className="mt-2 w-full max-w-md border border-[#183D35]/20 bg-white px-3 py-2 text-xs text-[#183D35]"
                    >
                      <option value="">Any Available Companion Therapist</option>
                      {eligibleStaff
                        .filter((m) => m.id !== selectedStaffId)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.designation})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="border-t border-[#183D35]/10 pt-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#183D35]">
                      Suite / Studio Allocation (
                      {isCouple
                        ? 'Couples Capacity ≥ 2'
                        : requiredRoomType !== 'any'
                        ? ROOM_TYPE_LABELS[requiredRoomType] || requiredRoomType
                        : 'Matched Treatment Room'}
                      )
                    </p>
                    <span className="text-[11px] text-[#858078]">
                      +{summary.buffer}m sanitization buffer enforced per room
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoomId('');
                        setSelectedSlot(null);
                      }}
                      className={`border p-3.5 text-left text-xs ${
                        selectedRoomId === ''
                          ? 'border-[#183D35] bg-[#F6F0E7] font-semibold text-[#183D35]'
                          : 'border-[#183D35]/15 bg-white text-[#252525]'
                      }`}
                    >
                      <p className="font-semibold">Auto-Assign Available Suite</p>
                      <p className="mt-0.5 font-normal text-[#858078]">
                        Matches any of {eligibleRooms.length} compatible room(s) free at your time
                      </p>
                    </button>
                    {eligibleRooms.map((r) => {
                      const rmBooked = roomBookedCountByDate.get(r.id) || 0;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setSelectedRoomId(r.id);
                            setSelectedSlot(null);
                          }}
                          className={`border p-3.5 text-left text-xs ${
                            selectedRoomId === r.id
                              ? 'border-[#183D35] bg-[#F6F0E7] font-semibold text-[#183D35]'
                              : 'border-[#183D35]/15 bg-white text-[#252525] hover:border-[#183D35]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold">{r.name}</p>
                            {selectedRoomId === r.id && <Check className="h-3.5 w-3.5 text-[#183D35]" />}
                          </div>
                          <p className="mt-0.5 text-[11px] font-normal text-[#858078]">
                            {ROOM_TYPE_LABELS[r.roomType] || r.roomType} · Cap {r.capacity} · {rmBooked} booked on {selectedDate}
                          </p>
                          {r.facilities.length > 0 && (
                            <p className="mt-1 text-[11px] font-normal text-[#252525]/75">
                              {r.facilities.slice(0, 3).join(' · ')}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#183D35]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 rounded-sm bg-[#183D35] px-6 py-3 text-xs font-semibold text-[#FBF9F5] hover:bg-[#112C26]"
                  >
                    Choose Date <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CHOOSE DATE */}
            {step === 4 && (
              <div className="space-y-6 border border-[#183D35]/15 bg-[#FBF9F5] p-6 sm:p-8">
                <div>
                  <h2 className="font-display text-3xl font-medium text-[#183D35]">
                    4. Choose Appointment Date
                  </h2>
                  <p className="mt-1 text-sm text-[#858078]">
                    All times operate in Nepal Standard Time (Asia/Kathmandu).
                  </p>
                </div>

                <div className="space-y-3">
                  <label htmlFor="booking-date" className="block text-xs font-semibold text-[#183D35]">
                    Gregorian Date (AD)
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    min={getKathmanduTodayIso()}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                      setConflictAlert(null);
                    }}
                    className="w-full max-w-xs rounded-sm border border-[#183D35]/25 bg-white px-4 py-3 text-sm tabular-nums text-[#252525]"
                  />

                  {bsSelectedDate && (
                    <p className="text-xs text-[#858078]">
                      Bikram Sambat (BS):{' '}
                      <strong className="text-[#183D35]">
                        {lang === 'ne' ? bsSelectedDate.formattedNe : bsSelectedDate.formattedEn}
                      </strong>
                    </p>
                  )}

                  {activeHoliday && (
                    <div className="border border-[#C4A36A] bg-[#F6F0E7] p-4 text-xs text-[#183D35]">
                      <p className="font-semibold">Nepal Holiday Notice: {activeHoliday.name}</p>
                      <p className="mt-1">
                        {activeHoliday.isClosed
                          ? 'Healing Touch is closed on this festival day. Please select another date.'
                          : `Special festival hours apply: ${activeHoliday.specialHours}`}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#183D35]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(activeHoliday?.isClosed)}
                    onClick={() => setStep(5)}
                    className="inline-flex items-center gap-2 rounded-sm bg-[#183D35] px-6 py-3 text-xs font-semibold text-[#FBF9F5] hover:bg-[#112C26] disabled:opacity-40"
                  >
                    View Live Time Slots <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: LIVE BACKEND AVAILABILITY SLOTS */}
            {step === 5 && (
              <div className="space-y-6 border border-[#183D35]/15 bg-[#FBF9F5] p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-3xl font-medium text-[#183D35]">
                      5. Choose Available Time
                    </h2>
                    <p className="mt-1 text-sm text-[#858078]">
                      Real-time slots verified against staff shifts, breaks, room occupancy, and {summary.buffer}-minute sanitization buffers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      refetchDaySlots();
                      checkAvailability(buildAvailabilityPayload());
                    }}
                    className="inline-flex items-center gap-1.5 border border-[#183D35]/20 bg-white px-3 py-1.5 text-[11px] font-medium text-[#183D35] hover:bg-[#F6F0E7]"
                  >
                    <RefreshCw className={`h-3 w-3 ${refreshingLiveSlots ? 'animate-spin' : ''}`} />
                    Sync Live Slots
                  </button>
                </div>

                {checkingSlots ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-16 animate-pulse bg-[#F6F0E7]" />
                    ))}
                  </div>
                ) : availabilityData?.closed ? (
                  <div className="border border-[#183D35]/15 bg-[#F6F0E7] p-6 text-sm text-[#183D35]">
                    {availabilityData.closedReason}
                  </div>
                ) : availabilityData?.staffUnavailableReason ? (
                  <div className="border border-[#183D35]/15 bg-[#F6F0E7] p-6 text-sm text-[#183D35]">
                    {availabilityData.staffUnavailableReason} — go back to choose another date or Any Available Specialist.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(availabilityData?.slots || []).map((slot) => {
                      const isPicked = selectedSlot?.startTime === slot.startTime;
                      const freeRmCount = slot.availableRoomIds?.length ?? eligibleRooms.length;
                      const freeStaffCount = slot.availableStaffIds?.length ?? eligibleStaff.length;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => {
                            setConflictAlert(null);
                            setSelectedSlot(slot);
                          }}
                          className={`border px-3 py-2.5 text-left transition-colors ${
                            !slot.available
                              ? 'cursor-not-allowed border-[#183D35]/10 bg-[#F6F0E7]/45 text-[#858078]/75'
                              : isPicked
                              ? 'border-[#183D35] bg-[#183D35] text-[#FBF9F5]'
                              : 'border-[#183D35]/20 bg-white text-[#183D35] hover:border-[#183D35]'
                          }`}
                        >
                          <p className={`text-xs font-semibold tabular-nums ${!slot.available ? 'line-through' : ''}`}>
                            {formatDisplayTime(slot.startTime)} – {formatDisplayTime(slot.endTime)}
                          </p>
                          {slot.available ? (
                            <p className={`mt-0.5 text-[10px] ${isPicked ? 'text-[#C4A36A]' : 'text-[#858078]'}`}>
                              {freeRmCount} suite{freeRmCount === 1 ? '' : 's'} · {freeStaffCount} specialist{freeStaffCount === 1 ? '' : 's'} free
                            </p>
                          ) : (
                            <p className="mt-0.5 text-[10px] text-amber-800/80">
                              {slot.reason || 'Unavailable'}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedSlot && (
                  <div className="border border-[#183D35]/15 bg-[#F6F0E7]/80 p-4 text-xs text-[#183D35]">
                    <p className="font-semibold">
                      Reserved Window: {formatDisplayTime(selectedSlot.startTime)} –{' '}
                      {formatDisplayTime(selectedSlot.endTime)}
                    </p>
                    <p className="mt-0.5 text-[#252525]/80">
                      Suite sanitization buffer extends to{' '}
                      <strong>
                        {formatDisplayTime(selectedSlot.bufferEndTime || selectedSlot.endTime)}
                      </strong>{' '}
                      ({summary.buffer} minutes reserved exclusively for room turnover).
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#183D35]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() => handleNextFromStep(5)}
                    className="inline-flex items-center gap-2 rounded-sm bg-[#183D35] px-6 py-3 text-xs font-semibold text-[#FBF9F5] hover:bg-[#112C26] disabled:opacity-40"
                  >
                    Enter Guest Details <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: CUSTOMER DETAILS & CONSENT */}
            {step === 6 && (
              <div className="space-y-6 border border-[#183D35]/15 bg-[#FBF9F5] p-6 sm:p-8">
                <div>
                  <h2 className="font-display text-3xl font-medium text-[#183D35]">
                    6. Guest Information &amp; Comfort Preferences
                  </h2>
                  <p className="mt-1 text-sm text-[#858078]">
                    We collect only essential appointment contact details and voluntary comfort preferences.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#183D35]">Full Name *</label>
                    <input
                      {...register('customerName')}
                      placeholder="e.g. Aarav Adhikari"
                      className="mt-1.5 w-full rounded-sm border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm"
                    />
                    {errors.customerName && (
                      <p className="mt-1 text-xs text-red-700">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#183D35]">
                      Nepal Phone / WhatsApp *
                    </label>
                    <input
                      {...register('customerPhone')}
                      placeholder="+977 98XXXXXXXX"
                      className="mt-1.5 w-full rounded-sm border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm tabular-nums"
                    />
                    {errors.customerPhone && (
                      <p className="mt-1 text-xs text-red-700">{errors.customerPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#183D35]">
                      Email (Optional)
                    </label>
                    <input
                      {...register('customerEmail')}
                      type="email"
                      placeholder="you@example.com"
                      className="mt-1.5 w-full rounded-sm border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm"
                    />
                    {errors.customerEmail && (
                      <p className="mt-1 text-xs text-red-700">{errors.customerEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#183D35]">
                      Preferred Communication Language
                    </label>
                    <select
                      {...register('preferredLanguage')}
                      className="mt-1.5 w-full rounded-sm border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm"
                    >
                      <option value="en">English</option>
                      <option value="ne">नेपाली (Nepali)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#183D35]">
                    Voluntary Comfort Preferences (Aroma, Pressure, Room Temperature)
                  </label>
                  <input
                    {...register('comfortPreferences')}
                    placeholder="e.g. Gentle pressure, unscented oil, warm room"
                    className="mt-1.5 w-full rounded-sm border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#183D35]">
                    Appointment Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    placeholder="Any timing requests or hair styling notes..."
                    className="mt-1.5 w-full rounded-sm border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div className="space-y-3 border-t border-[#183D35]/10 pt-4 text-xs text-[#252525]/85">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('agePolicyConfirmed')}
                      className="mt-0.5 h-4 w-4 accent-[#183D35]"
                    />
                    <span>
                      I confirm that all guests meet the age policy ({settings?.minimumAgeSpa || 18}+ for private spa suites; 14–17 accompanied by a guardian for salon services).
                    </span>
                  </label>
                  {errors.agePolicyConfirmed && (
                    <p className="text-xs text-red-700">{errors.agePolicyConfirmed.message}</p>
                  )}

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('consentAccepted')}
                      className="mt-0.5 h-4 w-4 accent-[#183D35]"
                    />
                    <span>
                      I have reviewed the non-medical treatment description, cancellation policy, and consent to Healing Touch Spa &amp; Saloon storing my appointment details securely.
                    </span>
                  </label>
                  {errors.consentAccepted && (
                    <p className="text-xs text-red-700">{errors.consentAccepted.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#183D35]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNextFromStep(6)}
                    className="inline-flex items-center gap-2 rounded-sm bg-[#183D35] px-6 py-3 text-xs font-semibold text-[#FBF9F5] hover:bg-[#112C26]"
                  >
                    Review &amp; Payment <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW & NEPAL PAYMENT VERIFICATION */}
            {step === 7 && (
              <form
                onSubmit={onConfirmBooking}
                className="space-y-6 border border-[#183D35]/15 bg-[#FBF9F5] p-6 sm:p-8"
              >
                <div>
                  <h2 className="font-display text-3xl font-medium text-[#183D35]">
                    7. Review Appointment &amp; Payment
                  </h2>
                  <p className="mt-1 text-sm text-[#858078]">
                    Choose Cash at Reception or test Nepal digital payment verification (eSewa / Khalti / Fonepay sandbox).
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 border border-[#183D35]/12 bg-white p-4 text-xs sm:grid-cols-2">
                  <div>
                    <p className="text-[#858078]">Guest &amp; Contact</p>
                    <p className="mt-0.5 font-semibold text-[#183D35]">
                      {getValues('customerName')} · {getValues('customerPhone')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#858078]">Date &amp; Session Window</p>
                    <p className="mt-0.5 font-semibold tabular-nums text-[#183D35]">
                      {selectedDate} · {selectedSlot ? `${formatDisplayTime(selectedSlot.startTime)}–${formatDisplayTime(selectedSlot.endTime)}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#858078]">Specialist Preference</p>
                    <p className="mt-0.5 font-semibold text-[#183D35]">
                      {selectedStaffObj ? selectedStaffObj.name : 'Auto-Assigned Open Specialist'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#858078]">Suite Allocation</p>
                    <p className="mt-0.5 font-semibold text-[#183D35]">
                      {selectedRoomObj ? selectedRoomObj.name : 'Auto-Assigned Open Suite'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      { id: 'cash', label: 'Cash at Desk' },
                      { id: 'esewa', label: 'eSewa (Sandbox)' },
                      { id: 'khalti', label: 'Khalti (Sandbox)' },
                      { id: 'fonepay', label: 'Fonepay (Sandbox)' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m.id);
                        setPaymentStatus('pending');
                        setGatewaySession(null);
                        setPaymentError(null);
                      }}
                      className={`border px-3 py-3 text-xs font-semibold transition-colors ${
                        paymentMethod === m.id
                          ? 'border-[#183D35] bg-[#183D35] text-[#FBF9F5]'
                          : 'border-[#183D35]/15 bg-white text-[#252525]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {paymentMethod !== 'cash' && (
                  <div className="border border-[#183D35]/15 bg-[#F6F0E7] p-5 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#183D35]">
                      <CreditCard className="h-4 w-4" />
                      <span>Server-Verified {paymentMethod.toUpperCase()} Sandbox</span>
                    </div>

                    {!gatewaySession ? (
                      <button
                        type="button"
                        disabled={initiatingPay}
                        onClick={handleStartSandboxPayment}
                        className="rounded-sm bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5] hover:bg-[#112C26]"
                      >
                        {initiatingPay ? 'Initiating...' : `Initiate ${paymentMethod.toUpperCase()} Verification`}
                      </button>
                    ) : paymentStatus === 'paid' ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#183D35]">
                        <ShieldCheck className="h-4 w-4 text-[#183D35]" />
                        <span>
                          Verified by server ({gatewaySession.transactionId}) — Ready to confirm booking.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-[#252525]/85">{gatewaySession.checkoutNote}</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={verifyingPay}
                            onClick={() => handleVerifySandboxPayment(false)}
                            className="rounded-sm bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5]"
                          >
                            {verifyingPay ? 'Verifying...' : 'Complete Sandbox Verification'}
                          </button>
                          <button
                            type="button"
                            disabled={verifyingPay}
                            onClick={() => handleVerifySandboxPayment(true)}
                            className="rounded-sm border border-[#183D35]/25 px-4 py-2 text-xs font-medium text-[#252525]"
                          >
                            Simulate Declined Payment
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentError && <p className="text-xs text-red-700">{paymentError}</p>}
                  </div>
                )}

                {submitError && (
                  <div className="border border-red-300 bg-red-50 p-3 text-xs text-red-800 space-y-2">
                    <p>{submitError}</p>
                    {conflictAlert && (
                      <button
                        type="button"
                        onClick={() => setStep(5)}
                        className="bg-[#183D35] px-3 py-1.5 text-[11px] font-semibold text-[#FBF9F5]"
                      >
                        Return to Live Time Slots
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(6)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#183D35]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Edit Details
                  </button>
                  <button
                    type="submit"
                    disabled={
                      savingBooking ||
                      verifyingConflict ||
                      (paymentMethod !== 'cash' && paymentStatus !== 'paid')
                    }
                    className="inline-flex items-center gap-2 rounded-sm bg-[#183D35] px-7 py-3 text-xs font-semibold text-[#FBF9F5] hover:bg-[#112C26] disabled:opacity-40"
                  >
                    {verifyingConflict
                      ? 'Checking Conflict...'
                      : savingBooking
                      ? 'Confirming...'
                      : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 8: CONFIRMED RECEIPT */}
            {step === 8 && confirmedBooking && (
              <div className="space-y-6 border border-[#183D35]/20 bg-[#F6F0E7] p-8">
                <div className="flex items-center gap-3 text-[#183D35]">
                  <Sparkles className="h-6 w-6 text-[#C4A36A]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#858078]">
                      Appointment Request Logged
                    </p>
                    <h2 className="font-display text-3xl font-medium">
                      Booking Reference: <span className="font-mono">{confirmedBooking.bookingRef}</span>
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-y border-[#183D35]/15 py-5 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#858078]">Services</p>
                    <p className="font-medium text-[#183D35]">{confirmedBooking.serviceNames.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#858078]">Date &amp; Time (Kathmandu)</p>
                    <p className="font-medium tabular-nums text-[#183D35]">
                      {confirmedBooking.date} · {formatDisplayTime(confirmedBooking.startTime)}–{formatDisplayTime(confirmedBooking.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#858078]">Assigned Specialist &amp; Suite</p>
                    <p className="font-medium text-[#183D35]">
                      {confirmedBooking.staffName} · {confirmedBooking.roomName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#858078]">Estimated Total</p>
                    <p className="font-mono font-semibold tabular-nums text-[#183D35]">
                      {formatNpr(confirmedBooking.totalNpr, lang)} ({confirmedBooking.paymentMethod.toUpperCase()})
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-sm bg-[#183D35] px-5 py-3 text-xs font-semibold text-[#FBF9F5] hover:bg-[#112C26]"
                    >
                      <MessageCircle className="h-4 w-4 text-[#C4A36A]" />
                      Send Confirmation via WhatsApp
                    </a>
                  )}
                  <Link
                    to="/my-bookings"
                    className="inline-flex items-center rounded-sm border border-[#183D35] px-5 py-3 text-xs font-semibold text-[#183D35] hover:bg-white"
                  >
                    View My Bookings
                  </Link>
                  <button
                    type="button"
                    onClick={handleBookAnother}
                    className="inline-flex items-center rounded-sm border border-[#183D35]/30 px-5 py-3 text-xs font-semibold text-[#183D35] hover:bg-white"
                  >
                    Book Another Appointment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Persistent Appointment Summary Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 border border-[#183D35]/15 bg-[#F6F0E7]/70 p-6 space-y-5">
              <div className="border-b border-[#183D35]/10 pb-3">
                <p className="text-xs font-semibold text-[#858078]">Appointment Summary</p>
                <h3 className="mt-1 font-display text-2xl font-medium text-[#183D35]">
                  {category === 'spa' ? 'Spa Ritual' : category === 'salon' ? 'Salon Session' : 'Signature Package'}
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-[#858078]">Selected Services</p>
                  {selectedItems.length === 0 ? (
                    <p className="text-xs italic text-[#858078]">None selected yet</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {summary.names.map((n) => (
                        <li key={n} className="font-medium text-[#183D35]">
                          {n}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-[#252525]/80">
                  <Clock className="h-3.5 w-3.5 text-[#183D35]" />
                  <span className="tabular-nums">
                    {formatDuration(summary.duration, lang)} (+{summary.buffer}m hygiene buffer)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#252525]/80">
                  <Calendar className="h-3.5 w-3.5 text-[#183D35]" />
                  <span className="tabular-nums">
                    {selectedDate}
                    {selectedSlot
                      ? ` · ${formatDisplayTime(selectedSlot.startTime)}–${formatDisplayTime(selectedSlot.endTime)}`
                      : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#252525]/80">
                  {isCouple ? (
                    <Users className="h-3.5 w-3.5 text-[#183D35]" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-[#183D35]" />
                  )}
                  <span>
                    {isCouple ? 'Couples Suite (2 Guests)' : 'Single Guest'} ·{' '}
                    {selectedStaffObj ? selectedStaffObj.name : 'Any Specialist'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#252525]/80">
                  <DoorOpen className="h-3.5 w-3.5 text-[#183D35]" />
                  <span>{selectedRoomObj ? selectedRoomObj.name : 'Auto-Assigned Suite'}</span>
                </div>
              </div>

              <div className="border-t border-[#183D35]/15 pt-4 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-[#858078]">Total (NPR)</span>
                <span className="font-mono text-xl font-semibold tabular-nums text-[#183D35]">
                  {formatNpr(summary.total, lang)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
};
