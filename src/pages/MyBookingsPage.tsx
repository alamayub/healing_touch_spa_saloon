import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import {
  useCancelMyBookingMutation,
  useCheckBookingConflictMutation,
  useGetBookingSlotsByDateQuery,
  useGetBusinessSettingsQuery,
  useGetHolidaysQuery,
  useGetMyBookingsQuery,
  useGetRoomsQuery,
  useGetStaffQuery,
  useUpdateAdminBookingMutation,
} from '../store/api/endpoints.ts';
import { useAppSelector } from '../store/index.ts';
import { Booking } from '../types/domain.ts';
import { formatDisplayTime, formatNpr, getKathmanduTodayIso } from '../utils/nepal.ts';

export const MyBookingsPage: React.FC = () => {
  const user = useAppSelector((s) => s.ui.user);
  const sessionRefs = useAppSelector((s) => s.ui.sessionBookingRefs);
  const lang = useAppSelector((s) => s.ui.language);

  const { data: myBookings = [], isLoading } = useGetMyBookingsQuery(user?.uid || '', {
    skip: !user?.uid,
  });
  const { data: settings } = useGetBusinessSettingsQuery();
  const { data: staff = [] } = useGetStaffQuery(false);
  const { data: rooms = [] } = useGetRoomsQuery(false);
  const { data: holidays = [] } = useGetHolidaysQuery();

  const [cancelBooking, { isLoading: cancelling }] = useCancelMyBookingMutation();
  const [rescheduleBooking, { isLoading: rescheduling }] = useUpdateAdminBookingMutation();
  const [checkConflict, { isLoading: checkingConflict }] = useCheckBookingConflictMutation();

  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('11:00');
  const [authError, setAuthError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: targetDateSlots = [] } = useGetBookingSlotsByDateQuery(newDate, {
    skip: !newDate,
  });

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch {
      setAuthError('Sign-in popup was closed or blocked. Please allow popups and try again.');
    }
  };

  const handleReschedule = async (b: Booking) => {
    if (!newDate) return;
    setActionError(null);
    setActionMessage(null);

    const todayIso = getKathmanduTodayIso();
    if (newDate < todayIso) {
      setActionError('Please choose today or a future date.');
      return;
    }

    const [h, m] = newStartTime.split(':').map(Number);
    const endMins = h * 60 + m + b.durationMinutes;
    const endTime = `${String(Math.floor(endMins / 60) % 24).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`;

    const staffMember = staff.find((s) => s.id === b.staffId);
    const activeHoliday = holidays.find((hl) => hl.date === newDate);

    try {
      const checkRes = await checkConflict({
        date: newDate,
        startTime: newStartTime,
        endTime,
        durationMinutes: b.durationMinutes,
        bufferMinutes: b.bufferMinutes || 15,
        openTime: settings?.openTime || '09:30',
        closeTime: settings?.closeTime || '20:30',
        staffId: b.staffId,
        roomId: b.roomId,
        isCouple: b.isCouple,
        existingSlots: targetDateSlots.filter((s) => s.bookingId !== b.id),
        staffShift: staffMember
          ? {
              id: staffMember.id,
              name: staffMember.name,
              shiftStart: staffMember.shiftStart,
              shiftEnd: staffMember.shiftEnd,
              breakStart: staffMember.breakStart,
              breakEnd: staffMember.breakEnd,
              workingDays: staffMember.workingDays,
            }
          : undefined,
        eligibleStaff: staff.map((s) => ({
          id: s.id,
          name: s.name,
          shiftStart: s.shiftStart,
          shiftEnd: s.shiftEnd,
          breakStart: s.breakStart,
          breakEnd: s.breakEnd,
          workingDays: s.workingDays,
        })),
        eligibleRooms: rooms
          .filter((r) => r.status === 'available' && (!b.isCouple || (r.supportsCouple && r.capacity >= 2)))
          .map((r) => ({
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
      }).unwrap();

      if (checkRes.conflict) {
        setActionError(checkRes.reason || 'That time window overlaps another appointment.');
        return;
      }

      await rescheduleBooking({
        bookingId: b.id,
        updates: { date: newDate, startTime: newStartTime, endTime },
      }).unwrap();

      setReschedulingId(null);
      setActionMessage(`Appointment ${b.bookingRef} moved to ${newDate} at ${formatDisplayTime(newStartTime)}.`);
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'data' in err
          ? String((err as { data?: { reason?: string } }).data?.reason || '')
          : typeof err === 'object' && err !== null && 'error' in err
          ? String((err as { error?: string }).error || '')
          : '';
      setActionError(msg.replace('BOOKING_CONFLICT:', '').trim() || 'Could not reschedule this time window.');
    }
  };

  return (
    <PublicLayout>
      <SeoHead
        title="My Bookings"
        description="View, reschedule, or cancel your Healing Touch Spa & Saloon appointments."
        noIndex
      />

      <section className="resort-grain border-b border-[#183D35]/10 bg-[#F6F0E7] py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-[0.22em] text-[#858078]">Guest Portal</p>
          <h1 className="mt-2 font-display text-4xl font-normal text-[#183D35] sm:text-5xl">
            My Reservations
          </h1>
          <p className="mt-3 text-sm text-[#252525]/80">
            Sign in with Google to view, reschedule, or cancel appointments linked to your account.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 space-y-8">
        {sessionRefs.length > 0 && (
          <div className="border border-[#C4A36A] bg-[#F6F0E7]/70 p-5 text-sm">
            <p className="font-semibold text-[#183D35]">Recent Booking Reference (This Session)</p>
            <p className="mt-1 font-mono text-xs text-[#252525]">{sessionRefs.join(', ')}</p>
          </div>
        )}

        {actionMessage && (
          <div className="border border-[#183D35]/20 bg-[#F6F0E7] p-4 text-xs font-medium text-[#183D35]">
            {actionMessage}
          </div>
        )}
        {actionError && (
          <div className="border border-red-300 bg-red-50 p-4 text-xs text-red-800">
            {actionError}
          </div>
        )}

        {!user ? (
          <div className="border border-[#183D35]/15 bg-[#FBF9F5] p-10 text-center">
            <h2 className="font-display text-3xl font-medium text-[#183D35]">
              Sign in to manage your appointments
            </h2>
            <p className="mt-2 text-sm text-[#858078]">
              For your privacy, customer phone numbers and booking histories are accessible only to the verified account owner.
            </p>
            {authError && <p className="mt-3 text-xs text-red-700">{authError}</p>}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-6 bg-[#183D35] px-7 py-3 text-xs font-semibold tracking-wider text-[#FBF9F5] transition-colors hover:bg-[#0E2620]"
            >
              Sign in with Google
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse bg-[#F6F0E7]" />
            ))}
          </div>
        ) : myBookings.length === 0 ? (
          <div className="border border-[#183D35]/15 bg-[#FBF9F5] p-10 text-center">
            <p className="font-display text-3xl text-[#183D35]">No appointments found yet</p>
            <Link
              to="/booking"
              className="mt-5 inline-block bg-[#183D35] px-6 py-3 text-xs font-semibold tracking-wider text-[#FBF9F5]"
            >
              Book Your First Visit
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.map((b) => (
              <div key={b.id} className="border border-[#183D35]/15 bg-[#FBF9F5] p-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-mono text-xs text-[#858078]">
                      {b.bookingRef} · Status:{' '}
                      <strong className="uppercase text-[#183D35]">{b.status}</strong>
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-medium text-[#183D35]">
                      {b.serviceNames.join(', ')}
                    </h2>
                    <p className="mt-1 text-sm text-[#252525]/80 tabular-nums">
                      {b.date} at {formatDisplayTime(b.startTime)} ·{' '}
                      {b.staffName || 'Reception Match'}
                      {b.roomName ? ` · ${b.roomName}` : ''}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-mono text-base font-semibold tabular-nums text-[#183D35]">
                      {formatNpr(b.totalNpr, lang)}
                    </p>
                    <p className="text-xs text-[#858078] capitalize">{b.paymentMethod}</p>
                  </div>
                </div>

                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#183D35]/10 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setReschedulingId(reschedulingId === b.id ? null : b.id);
                        setNewDate(b.date >= getKathmanduTodayIso() ? b.date : getKathmanduTodayIso());
                        setNewStartTime(b.startTime);
                        setActionError(null);
                      }}
                      className="border border-[#183D35]/25 px-4 py-2 text-xs font-medium text-[#183D35] transition-colors hover:bg-[#F6F0E7]"
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={() => cancelBooking(b.id)}
                      className="border border-red-300 px-4 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}

                {reschedulingId === b.id && (
                  <div className="mt-4 flex flex-wrap items-end gap-3 bg-[#F6F0E7] p-4">
                    <div>
                      <label className="block text-xs text-[#183D35]">New Date</label>
                      <input
                        type="date"
                        min={getKathmanduTodayIso()}
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="mt-1 border border-[#183D35]/20 bg-white px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#183D35]">New Start Time</label>
                      <input
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="mt-1 border border-[#183D35]/20 bg-white px-3 py-1.5 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={checkingConflict || rescheduling}
                      onClick={() => handleReschedule(b)}
                      className="bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5] disabled:opacity-50"
                    >
                      {checkingConflict || rescheduling ? 'Checking Slot...' : 'Save New Time'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
};
