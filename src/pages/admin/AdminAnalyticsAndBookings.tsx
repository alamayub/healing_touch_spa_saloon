import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  useGetAdminBookingsQuery,
  useGetAdminPaymentsQuery,
  useGetBookingSlotsByDateQuery,
  useGetCustomersQuery,
  useGetHolidaysQuery,
  useGetPackagesQuery,
  useGetRoomsQuery,
  useGetSalonServicesQuery,
  useGetSpaServicesQuery,
  useGetStaffQuery,
  useRemoveBookingMutation,
  useRemoveCustomerMutation,
  useRemoveHolidayMutation,
  useSaveCustomerMutation,
  useSaveHolidayMutation,
  useSavePaymentRecordMutation,
  useSaveRoomMutation,
  useSaveStaffMutation,
  useUpdateAdminBookingMutation,
  useUpdatePaymentStatusMutation,
} from '../../store/api/endpoints.ts';
import {
  Booking,
  BookingStatus,
  CustomerRecord,
  Holiday,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  SpaRoom,
  StaffMember,
} from '../../types/domain.ts';
import { formatDisplayTime, formatNpr, getKathmanduTodayIso } from '../../utils/nepal.ts';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AdminOverviewSection: React.FC = () => {
  const { data: bookings = [] } = useGetAdminBookingsQuery();
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: staff = [] } = useGetStaffQuery(true);
  const { data: spaServices = [] } = useGetSpaServicesQuery(true);
  const { data: salonServices = [] } = useGetSalonServicesQuery(true);
  const { data: packages = [] } = useGetPackagesQuery(true);

  const [divisionFilter, setDivisionFilter] = useState<'all' | 'spa' | 'salon' | 'package'>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const today = getKathmanduTodayIso();

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (divisionFilter !== 'all' && b.category !== divisionFilter) return false;
      if (staffFilter !== 'all' && b.staffId !== staffFilter) return false;
      if (dateFrom && b.date < dateFrom) return false;
      if (dateTo && b.date > dateTo) return false;
      return true;
    });
  }, [bookings, divisionFilter, staffFilter, dateFrom, dateTo]);

  const metrics = useMemo(() => {
    const todayCount = filteredBookings.filter((b) => b.date === today).length;
    const pendingCount = filteredBookings.filter((b) => b.status === 'pending').length;
    const completed = filteredBookings.filter((b) => b.status === 'completed');
    const spaRev = completed
      .filter((b) => b.category === 'spa')
      .reduce((acc, b) => acc + b.totalNpr, 0);
    const salonRev = completed
      .filter((b) => b.category === 'salon')
      .reduce((acc, b) => acc + b.totalNpr, 0);
    const pkgRev = completed
      .filter((b) => b.category === 'package')
      .reduce((acc, b) => acc + b.totalNpr, 0);

    return {
      totalBookings: filteredBookings.length,
      todayCount,
      pendingCount,
      completedCount: completed.length,
      totalCustomers: customers.length,
      spaRev,
      salonRev,
      pkgRev,
    };
  }, [filteredBookings, customers.length, today]);

  const chartData = useMemo(() => {
    const byDate = new Map<string, { date: string; spa: number; salon: number; package: number }>();
    filteredBookings.forEach((b) => {
      const existing = byDate.get(b.date) || { date: b.date, spa: 0, salon: 0, package: 0 };
      if (b.category === 'spa') existing.spa += b.totalNpr;
      else if (b.category === 'salon') existing.salon += b.totalNpr;
      else existing.package += b.totalNpr;
      byDate.set(b.date, existing);
    });
    const rows = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    if (rows.length > 0) return rows.slice(-8);
    return [{ date: today, spa: 0, salon: 0, package: 0 }];
  }, [filteredBookings, today]);

  const popularServices = useMemo(() => {
    const counts = new Map<string, number>();
    filteredBookings.forEach((b) => {
      b.serviceNames.forEach((name) => counts.set(name, (counts.get(name) || 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredBookings]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-4 border border-[#183D35]/12 bg-white p-4">
        <div>
          <label className="block text-[11px] font-semibold text-[#858078]">Division</label>
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value as typeof divisionFilter)}
            className="mt-1 border border-[#183D35]/20 bg-[#FBF9F5] px-3 py-1.5 text-xs"
          >
            <option value="all">All Divisions</option>
            <option value="spa">Spa</option>
            <option value="salon">Salon</option>
            <option value="package">Packages</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#858078]">Staff Member</label>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="mt-1 border border-[#183D35]/20 bg-[#FBF9F5] px-3 py-1.5 text-xs"
          >
            <option value="all">All Staff</option>
            {staff.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#858078]">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="mt-1 border border-[#183D35]/20 bg-[#FBF9F5] px-3 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#858078]">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="mt-1 border border-[#183D35]/20 bg-[#FBF9F5] px-3 py-1.5 text-xs"
          />
        </div>
        {(divisionFilter !== 'all' || staffFilter !== 'all' || dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              setDivisionFilter('all');
              setStaffFilter('all');
              setDateFrom('');
              setDateTo('');
            }}
            className="border border-[#183D35]/20 px-3 py-1.5 text-xs font-medium text-[#183D35]"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Bookings', val: String(metrics.totalBookings) },
          { label: "Today's Appointments", val: String(metrics.todayCount) },
          { label: 'Pending Approval', val: String(metrics.pendingCount) },
          { label: 'Completed Sessions', val: String(metrics.completedCount) },
          { label: 'Spa Revenue (Completed)', val: formatNpr(metrics.spaRev) },
          { label: 'Salon Revenue (Completed)', val: formatNpr(metrics.salonRev) },
          { label: 'Package Sales (Completed)', val: formatNpr(metrics.pkgRev) },
          {
            label: 'Active Catalog Items',
            val: String(spaServices.length + salonServices.length + packages.length),
          },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-[#183D35]/12 bg-white p-5">
            <p className="text-xs text-[#858078]">{kpi.label}</p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#183D35]">
              {kpi.val}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 border border-[#183D35]/12 bg-white p-6">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">
            Revenue by Category (NPR)
          </h3>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DED2" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="spa" name="Spa" fill="#183D35" />
                <Bar dataKey="salon" name="Salon" fill="#C4A36A" />
                <Bar dataKey="package" name="Packages" fill="#858078" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 border border-[#183D35]/12 bg-white p-6">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">Popular Services</h3>
          {popularServices.length === 0 ? (
            <p className="mt-4 text-sm text-[#858078]">
              Bookings created on the public site will rank here automatically.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#183D35]/10 text-sm">
              {popularServices.map(([name, count]) => (
                <li key={name} className="flex items-center justify-between py-3">
                  <span className="text-[#252525] truncate pr-3">{name}</span>
                  <span className="font-mono text-xs font-semibold tabular-nums text-[#183D35]">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border border-[#183D35]/12 bg-white p-6">
        <h3 className="font-display text-2xl font-medium text-[#183D35]">Recent Appointments</h3>
        {filteredBookings.length === 0 ? (
          <p className="mt-4 text-sm text-[#858078]">No appointments match your current filter.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#183D35]/15 text-[#858078]">
                <tr>
                  <th className="py-2.5 pr-4">Ref</th>
                  <th className="py-2.5 pr-4">Guest</th>
                  <th className="py-2.5 pr-4">Services</th>
                  <th className="py-2.5 pr-4">Date &amp; Time</th>
                  <th className="py-2.5 pr-4">Status</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#183D35]/10">
                {filteredBookings.slice(0, 8).map((b) => (
                  <tr key={b.id} className="hover:bg-[#F6F0E7]/40">
                    <td className="py-3 pr-4 font-mono">{b.bookingRef}</td>
                    <td className="py-3 pr-4 font-medium text-[#183D35]">{b.customerName}</td>
                    <td className="py-3 pr-4">{b.serviceNames.join(', ')}</td>
                    <td className="py-3 pr-4 tabular-nums">
                      {b.date} · {formatDisplayTime(b.startTime)}
                    </td>
                    <td className="py-3 pr-4 uppercase font-semibold text-[#183D35]">{b.status}</td>
                    <td className="py-3 text-right font-mono tabular-nums">
                      {formatNpr(b.totalNpr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminBookingsSection: React.FC = () => {
  const { data: bookings = [], isLoading } = useGetAdminBookingsQuery();
  const { data: staff = [] } = useGetStaffQuery(true);
  const { data: rooms = [] } = useGetRoomsQuery(true);
  const [updateBooking] = useUpdateAdminBookingMutation();
  const [removeBooking] = useRemoveBookingMutation();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [divisionFilter, setDivisionFilter] = useState<'all' | 'spa' | 'salon' | 'package'>('all');
  const [search, setSearch] = useState('');
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (divisionFilter !== 'all' && b.category !== divisionFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      b.bookingRef.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.toLowerCase().includes(q)
    );
  });

  const safeUpdate = async (
    bookingId: string,
    updates: Parameters<typeof updateBooking>[0]['updates']
  ) => {
    setActionError(null);
    try {
      await updateBooking({ bookingId, updates }).unwrap();
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'error' in err
          ? String((err as { error?: string }).error || '')
          : '';
      setActionError(msg.replace('BOOKING_CONFLICT:', '').trim() || 'Could not update booking due to a schedule conflict.');
    }
  };

  const handleSaveReschedule = async (b: Booking) => {
    if (!editDate || !editStartTime) return;
    const [h, m] = editStartTime.split(':').map(Number);
    const endMins = h * 60 + m + b.durationMinutes;
    const endTime = `${String(Math.floor(endMins / 60) % 24).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`;
    await safeUpdate(b.id, { date: editDate, startTime: editStartTime, endTime });
    setEditingTimeId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#183D35]/12 bg-white p-4">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show'] as const).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium capitalize ${
                  statusFilter === st
                    ? 'bg-[#183D35] text-[#FBF9F5]'
                    : 'border border-[#183D35]/15 bg-[#FBF9F5] text-[#252525]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            )
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value as typeof divisionFilter)}
            className="border border-[#183D35]/20 bg-[#FBF9F5] px-2.5 py-1.5 text-xs"
          >
            <option value="all">All Divisions</option>
            <option value="spa">Spa</option>
            <option value="salon">Salon</option>
            <option value="package">Packages</option>
          </select>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ref, guest, phone..."
            className="w-56 border border-[#183D35]/20 bg-[#FBF9F5] px-3 py-1.5 text-xs"
          />
        </div>
      </div>

      {actionError && (
        <div className="border border-red-300 bg-red-50 p-3 text-xs text-red-800">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="h-48 animate-pulse bg-white" />
      ) : filtered.length === 0 ? (
        <div className="border border-[#183D35]/12 bg-white p-10 text-center text-sm text-[#858078]">
          No bookings found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="border border-[#183D35]/12 bg-white p-5 space-y-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="font-mono text-xs text-[#858078]">
                    {b.bookingRef} · {b.category.toUpperCase()} · {b.isCouple ? 'Couple (2)' : 'Single (1)'}
                  </p>
                  <h4 className="mt-1 font-display text-2xl font-medium text-[#183D35]">
                    {b.customerName} · <span className="font-mono text-sm">{b.customerPhone}</span>
                  </h4>
                  {b.customerEmail && <p className="text-xs text-[#858078]">{b.customerEmail}</p>}
                  <p className="mt-1 text-xs text-[#252525]/80">
                    Services: <strong>{b.serviceNames.join(', ')}</strong>
                  </p>
                  <p className="mt-1 text-xs text-[#858078] tabular-nums">
                    {b.date} · {formatDisplayTime(b.startTime)}–{formatDisplayTime(b.endTime)} (+
                    {b.bufferMinutes}m buffer)
                  </p>
                  {b.comfortPreferences && (
                    <p className="mt-1 text-xs text-[#183D35]">
                      Comfort Notes: {b.comfortPreferences}
                    </p>
                  )}
                  {b.notes && <p className="mt-0.5 text-xs text-[#858078]">Notes: {b.notes}</p>}
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block border border-[#183D35]/20 bg-[#F6F0E7] px-2.5 py-1 text-[11px] font-semibold uppercase text-[#183D35]">
                    {b.status}
                  </span>
                  <p className="mt-2 font-mono text-base font-semibold tabular-nums text-[#183D35]">
                    {formatNpr(b.totalNpr)}
                  </p>
                  <p className="text-[11px] text-[#858078] uppercase">
                    {b.paymentMethod} · {b.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-[#183D35]/10 pt-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] text-[#858078]">Assign Specialist</label>
                  <select
                    value={b.staffId || ''}
                    onChange={(e) => {
                      const m = staff.find((s) => s.id === e.target.value);
                      safeUpdate(b.id, {
                        staffId: m?.id || '',
                        staffName: m?.name || 'Any Available',
                      });
                    }}
                    className="mt-1 w-full border border-[#183D35]/20 bg-[#FBF9F5] px-2.5 py-1.5 text-xs"
                  >
                    <option value="">Any Available Specialist</option>
                    {staff.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#858078]">Allocate Suite / Room</label>
                  <select
                    value={b.roomId || ''}
                    onChange={(e) => {
                      const r = rooms.find((rm) => rm.id === e.target.value);
                      safeUpdate(b.id, {
                        roomId: r?.id || '',
                        roomName: r?.name || 'Unassigned',
                      });
                    }}
                    className="mt-1 w-full border border-[#183D35]/20 bg-[#FBF9F5] px-2.5 py-1.5 text-xs"
                  >
                    <option value="">Select Suite</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Cap {r.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#858078]">Payment Status</label>
                  <select
                    value={b.paymentStatus}
                    onChange={(e) =>
                      safeUpdate(b.id, {
                        paymentStatus: e.target.value as PaymentStatus,
                      })
                    }
                    className="mt-1 w-full border border-[#183D35]/20 bg-[#FBF9F5] px-2.5 py-1.5 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="advance_paid">Advance Paid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {editingTimeId === b.id && (
                <div className="flex flex-wrap items-end gap-3 bg-[#F6F0E7] p-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#183D35]">New Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="mt-1 border border-[#183D35]/20 bg-white px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#183D35]">New Start Time</label>
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className="mt-1 border border-[#183D35]/20 bg-white px-2.5 py-1 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveReschedule(b)}
                    className="bg-[#183D35] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Save Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTimeId(null)}
                    className="text-xs text-[#858078] underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t border-[#183D35]/10 pt-3">
                <button
                  type="button"
                  onClick={() => safeUpdate(b.id, { status: 'confirmed' as BookingStatus })}
                  className="bg-[#183D35] px-3 py-1.5 text-xs font-medium text-[#FBF9F5]"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => safeUpdate(b.id, { status: 'completed' as BookingStatus })}
                  className="border border-[#183D35] px-3 py-1.5 text-xs font-medium text-[#183D35]"
                >
                  Mark Completed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTimeId(editingTimeId === b.id ? null : b.id);
                    setEditDate(b.date);
                    setEditStartTime(b.startTime);
                  }}
                  className="border border-[#183D35]/25 px-3 py-1.5 text-xs font-medium text-[#183D35]"
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => safeUpdate(b.id, { status: 'no_show' as BookingStatus })}
                  className="border border-[#183D35]/25 px-3 py-1.5 text-xs font-medium text-[#252525]"
                >
                  No-Show
                </button>
                <button
                  type="button"
                  onClick={() => safeUpdate(b.id, { status: 'rejected' as BookingStatus })}
                  className="border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => safeUpdate(b.id, { status: 'cancelled' as BookingStatus })}
                  className="border border-[#183D35]/20 px-3 py-1.5 text-xs font-medium text-[#858078]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => removeBooking(b.id)}
                  className="border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
                <a
                  href={`tel:${b.customerPhone.replace(/\s+/g, '')}`}
                  className="ml-auto border border-[#183D35]/25 px-3 py-1.5 text-xs font-medium text-[#183D35]"
                >
                  Call Guest
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StaffShiftRow: React.FC<{
  member: StaffMember;
  onSave: (updated: StaffMember) => Promise<void>;
}> = ({ member, onSave }) => {
  const [shiftStart, setShiftStart] = useState(member.shiftStart);
  const [shiftEnd, setShiftEnd] = useState(member.shiftEnd);
  const [breakStart, setBreakStart] = useState(member.breakStart || '');
  const [breakEnd, setBreakEnd] = useState(member.breakEnd || '');
  const [workingDays, setWorkingDays] = useState<string[]>(member.workingDays);
  const [available, setAvailable] = useState(member.availableForBooking);
  const [saved, setSaved] = useState(false);

  const toggleDay = (d: string) => {
    setWorkingDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
    setSaved(false);
  };

  return (
    <div className="space-y-3 border border-[#183D35]/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-[#183D35]">{member.name}</p>
          <p className="text-xs text-[#858078]">{member.designation}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 text-[#183D35]">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => {
                setAvailable(e.target.checked);
                setSaved(false);
              }}
            />
            Accepting Bookings
          </label>
          <button
            type="button"
            onClick={async () => {
              await onSave({
                ...member,
                shiftStart,
                shiftEnd,
                breakStart: breakStart || undefined,
                breakEnd: breakEnd || undefined,
                workingDays: workingDays.length > 0 ? workingDays : WEEKDAYS,
                availableForBooking: available,
              });
              setSaved(true);
            }}
            className="bg-[#183D35] px-3 py-1.5 text-xs font-medium text-[#FBF9F5]"
          >
            {saved ? 'Saved' : 'Save Schedule'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-[11px] text-[#858078]">Shift Start</label>
          <input
            type="time"
            value={shiftStart}
            onChange={(e) => {
              setShiftStart(e.target.value);
              setSaved(false);
            }}
            className="mt-1 w-full border border-[#183D35]/20 px-2 py-1 text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#858078]">Shift End</label>
          <input
            type="time"
            value={shiftEnd}
            onChange={(e) => {
              setShiftEnd(e.target.value);
              setSaved(false);
            }}
            className="mt-1 w-full border border-[#183D35]/20 px-2 py-1 text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#858078]">Break Start</label>
          <input
            type="time"
            value={breakStart}
            onChange={(e) => {
              setBreakStart(e.target.value);
              setSaved(false);
            }}
            className="mt-1 w-full border border-[#183D35]/20 px-2 py-1 text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#858078]">Break End</label>
          <input
            type="time"
            value={breakEnd}
            onChange={(e) => {
              setBreakEnd(e.target.value);
              setSaved(false);
            }}
            className="mt-1 w-full border border-[#183D35]/20 px-2 py-1 text-xs"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="mr-1 text-[#858078]">Working Days:</span>
        {WEEKDAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => toggleDay(d)}
            className={`border px-2 py-0.5 ${
              workingDays.includes(d)
                ? 'border-[#183D35] bg-[#F6F0E7] font-semibold text-[#183D35]'
                : 'border-[#183D35]/15 text-[#858078]'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
};

export const AdminSchedulesAndHolidaysSection: React.FC = () => {
  const { data: staff = [] } = useGetStaffQuery(true);
  const { data: holidays = [] } = useGetHolidaysQuery();
  const [saveStaff] = useSaveStaffMutation();
  const [saveHoliday] = useSaveHolidayMutation();
  const [removeHoliday] = useRemoveHolidayMutation();

  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [holName, setHolName] = useState('');
  const [holDate, setHolDate] = useState('');
  const [holBs, setHolBs] = useState('');
  const [holClosed, setHolClosed] = useState(true);
  const [specialHours, setSpecialHours] = useState('11:00 - 18:00');

  const resetHolidayForm = () => {
    setEditingHolidayId(null);
    setHolName('');
    setHolDate('');
    setHolBs('');
    setHolClosed(true);
    setSpecialHours('11:00 - 18:00');
  };

  const handleSaveHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holName.trim() || !holDate) return;
    const h: Holiday = {
      id: editingHolidayId || `hol-${Date.now()}`,
      name: holName.trim(),
      date: holDate,
      bsDate: holBs.trim() || undefined,
      isClosed: holClosed,
      specialHours: holClosed ? undefined : specialHours.trim() || '11:00 - 18:00',
    };
    await saveHoliday(h);
    resetHolidayForm();
  };

  return (
    <div className="space-y-8">
      <div className="border border-[#183D35]/12 bg-white p-6">
        <h3 className="font-display text-2xl font-medium text-[#183D35]">
          Staff Shifts, Breaks &amp; Working Days
        </h3>
        <div className="mt-4 space-y-4">
          {staff.map((m) => (
            <StaffShiftRow
              key={m.id}
              member={m}
              onSave={async (updated) => {
                await saveStaff(updated).unwrap();
              }}
            />
          ))}
        </div>
      </div>

      <div className="border border-[#183D35]/12 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">
            Nepal Public Holidays &amp; Special Hours
          </h3>
          {editingHolidayId && (
            <button type="button" onClick={resetHolidayForm} className="text-xs text-[#858078] underline">
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSaveHoliday} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-6">
          <input
            value={holName}
            onChange={(e) => setHolName(e.target.value)}
            placeholder="Festival / Holiday Name *"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-2"
            required
          />
          <input
            type="date"
            value={holDate}
            onChange={(e) => setHolDate(e.target.value)}
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
            required
          />
          <input
            value={holBs}
            onChange={(e) => setHolBs(e.target.value)}
            placeholder="BS Date (optional)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <label className="flex items-center gap-2 border border-[#183D35]/15 px-3 py-2 text-xs">
            <input
              type="checkbox"
              checked={holClosed}
              onChange={(e) => setHolClosed(e.target.checked)}
            />
            Closed All Day
          </label>
          {!holClosed && (
            <input
              value={specialHours}
              onChange={(e) => setSpecialHours(e.target.value)}
              placeholder="HH:MM - HH:MM (24h)"
              className="border border-[#183D35]/20 px-3 py-2 text-xs"
            />
          )}
          <button
            type="submit"
            className="bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5]"
          >
            {editingHolidayId ? 'Save Holiday' : 'Add Holiday'}
          </button>
        </form>

        <div className="mt-5 divide-y divide-[#183D35]/10">
          {holidays.map((h) => (
            <div key={h.id} className="flex items-center justify-between gap-4 py-3 text-xs">
              <div>
                <p className="font-medium text-[#183D35]">{h.name}</p>
                <p className="text-[#858078] tabular-nums">
                  {h.date} {h.bsDate ? `(${h.bsDate})` : ''} ·{' '}
                  {h.isClosed ? 'Closed All Day' : `Special Hours: ${h.specialHours || 'Open'}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingHolidayId(h.id);
                    setHolName(h.name);
                    setHolDate(h.date);
                    setHolBs(h.bsDate || '');
                    setHolClosed(h.isClosed);
                    setSpecialHours(h.specialHours || '11:00 - 18:00');
                  }}
                  className="text-[#183D35] underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeHoliday(h.id)}
                  className="text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminRoomScheduleSection: React.FC = () => {
  const { data: rooms = [] } = useGetRoomsQuery(true);
  const { data: bookings = [] } = useGetAdminBookingsQuery();
  const [selectedDate, setSelectedDate] = useState(getKathmanduTodayIso());
  const { data: daySlots = [] } = useGetBookingSlotsByDateQuery(selectedDate);
  const [saveRoom] = useSaveRoomMutation();

  const toggleStatus = (room: SpaRoom, next: SpaRoom['status']) => {
    saveRoom({ ...room, status: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#183D35]/12 bg-white p-4">
        <div>
          <h3 className="font-display text-2xl font-medium text-[#183D35]">
            Live Room &amp; Suite Occupancy
          </h3>
          <p className="text-xs text-[#858078]">
            Inspect active suite reservations and change room availability for maintenance.
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-[#183D35]/20 bg-[#FBF9F5] px-3 py-1.5 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rooms.map((r) => {
          const slotsToday = daySlots.filter(
            (s) =>
              s.roomId === r.id &&
              s.status !== 'cancelled' &&
              s.status !== 'rejected' &&
              s.status !== 'no_show'
          );
          const allRoomBookings = bookings.filter(
            (b) => b.roomId === r.id && b.status !== 'cancelled' && b.status !== 'rejected'
          );
          return (
            <div key={r.id} className="border border-[#183D35]/12 bg-white p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display text-xl font-medium text-[#183D35]">{r.name}</h4>
                  <p className="text-xs text-[#858078]">
                    Capacity: {r.capacity} · {r.supportsCouple ? 'Couple Capable' : 'Single / Studio'}
                  </p>
                </div>
                <select
                  value={r.status}
                  onChange={(e) => toggleStatus(r, e.target.value as SpaRoom['status'])}
                  className="border border-[#183D35]/20 bg-[#FBF9F5] px-2.5 py-1 text-xs"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <p className="text-xs text-[#252525]/80">{r.facilities.join(' · ')}</p>
              <div className="border-t border-[#183D35]/10 pt-2.5 text-xs">
                <p className="font-semibold text-[#183D35]">
                  Schedule for {selectedDate} ({slotsToday.length} active · {allRoomBookings.length} total):
                </p>
                {slotsToday.length === 0 ? (
                  <p className="mt-1 text-[#858078]">Open all day on {selectedDate}.</p>
                ) : (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {slotsToday.map((s) => (
                      <span
                        key={s.id}
                        className="border border-[#183D35]/20 bg-[#F6F0E7] px-2 py-0.5 font-mono text-[11px] text-[#183D35]"
                      >
                        {formatDisplayTime(s.startTime)}–{formatDisplayTime(s.endTime)} ({s.status})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AdminPaymentsSection: React.FC = () => {
  const { data: payments = [] } = useGetAdminPaymentsQuery();
  const { data: bookings = [] } = useGetAdminBookingsQuery();
  const [updateStatus] = useUpdatePaymentStatusMutation();
  const [updateBooking] = useUpdateAdminBookingMutation();
  const [savePayment] = useSavePaymentRecordMutation();

  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentRecord['status']>('all');

  const [bookingRef, setBookingRef] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountNpr, setAmountNpr] = useState(3200);
  const [gatewayRef, setGatewayRef] = useState('');

  const filtered = payments.filter((p) => {
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const handleRecordDeskPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef.trim()) return;
    const matched = bookings.find(
      (b) => b.bookingRef.toLowerCase() === bookingRef.trim().toLowerCase()
    );
    await savePayment({
      id: `pay-${Date.now()}`,
      bookingId: matched?.id || `desk-${Date.now()}`,
      bookingRef: bookingRef.trim().toUpperCase(),
      method,
      amountNpr,
      isAdvance: false,
      status: 'verified',
      gatewayRef: gatewayRef.trim() || 'DESK-RECEIPT',
      verifiedByServer: true,
    });
    if (matched) {
      await updateBooking({
        bookingId: matched.id,
        updates: { paymentStatus: 'paid' },
      });
    }
    setBookingRef('');
    setGatewayRef('');
  };

  const handlePaymentStatusSync = async (p: PaymentRecord, nextStatus: PaymentRecord['status']) => {
    await updateStatus({ id: p.id, status: nextStatus });
    const matched = bookings.find((b) => b.id === p.bookingId || b.bookingRef === p.bookingRef);
    if (matched) {
      const nextBookingPayStatus: PaymentStatus =
        nextStatus === 'verified'
          ? 'paid'
          : nextStatus === 'refunded'
          ? 'refunded'
          : nextStatus === 'failed'
          ? 'failed'
          : 'pending';
      await updateBooking({
        bookingId: matched.id,
        updates: { paymentStatus: nextBookingPayStatus },
      });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleRecordDeskPayment} className="grid grid-cols-1 gap-3 border border-[#183D35]/12 bg-white p-5 sm:grid-cols-5">
        <input
          value={bookingRef}
          onChange={(e) => setBookingRef(e.target.value)}
          placeholder="Booking Ref (e.g. HT-XXXX)"
          className="border border-[#183D35]/20 px-3 py-2 text-xs"
          required
        />
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          className="border border-[#183D35]/20 px-3 py-2 text-xs"
        >
          <option value="cash">Cash at Desk</option>
          <option value="esewa">eSewa</option>
          <option value="khalti">Khalti</option>
          <option value="fonepay">Fonepay</option>
        </select>
        <input
          type="number"
          min={0}
          value={amountNpr}
          onChange={(e) => setAmountNpr(Number(e.target.value))}
          placeholder="Amount NPR"
          className="border border-[#183D35]/20 px-3 py-2 text-xs"
        />
        <input
          value={gatewayRef}
          onChange={(e) => setGatewayRef(e.target.value)}
          placeholder="Receipt / Gateway Ref"
          className="border border-[#183D35]/20 px-3 py-2 text-xs"
        />
        <button type="submit" className="bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5]">
          Record Payment
        </button>
      </form>

      <div className="border border-[#183D35]/12 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-medium text-[#183D35]">
              Nepal Payment &amp; Refund Ledger
            </h3>
            <p className="mt-1 text-xs text-[#858078]">
              Supports Cash at Desk, eSewa, Khalti, and Fonepay verification tracking (auto-syncs linked booking status).
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
              className="border border-[#183D35]/20 bg-[#FBF9F5] px-2.5 py-1.5"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
              <option value="fonepay">Fonepay</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="border border-[#183D35]/20 bg-[#FBF9F5] px-2.5 py-1.5"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 text-sm text-[#858078]">No payment transactions match this filter.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#183D35]/15 text-[#858078]">
                <tr>
                  <th className="py-2.5 pr-4">Booking Ref</th>
                  <th className="py-2.5 pr-4">Method</th>
                  <th className="py-2.5 pr-4">Gateway Ref</th>
                  <th className="py-2.5 pr-4">Verification</th>
                  <th className="py-2.5 pr-4">Status</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#183D35]/10">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4 font-mono">{p.bookingRef}</td>
                    <td className="py-3 pr-4 uppercase">{p.method}</td>
                    <td className="py-3 pr-4 font-mono">{p.gatewayRef || '—'}</td>
                    <td className="py-3 pr-4">
                      {p.status === 'verified' || p.verifiedByServer ? 'Verified' : 'Desk / Pending'}
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={p.status}
                        onChange={(e) =>
                          handlePaymentStatusSync(p, e.target.value as PaymentRecord['status'])
                        }
                        className="border border-[#183D35]/20 px-2 py-1 text-xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums">
                      {formatNpr(p.amountNpr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminCustomersSection: React.FC = () => {
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: bookings = [] } = useGetAdminBookingsQuery();
  const [saveCustomer] = useSaveCustomerMutation();
  const [removeCustomer] = useRemoveCustomerMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState('');
  const [totalBookings, setTotalBookings] = useState(0);
  const [search, setSearch] = useState('');

  const reset = () => {
    setEditingId(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setPreferences('');
    setTotalBookings(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;
    await saveCustomer({
      id: editingId || `cust-${Date.now()}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      preferredLanguage: 'en',
      preferences: preferences.trim() || undefined,
      totalBookings,
    });
    reset();
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.fullName.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
  });

  const filteredGuestBookings = bookings.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return b.customerName.toLowerCase().includes(q) || b.customerPhone.toLowerCase().includes(q);
  });

  const startEdit = (c: CustomerRecord) => {
    setEditingId(c.id);
    setFullName(c.fullName);
    setPhone(c.phone);
    setEmail(c.email || '');
    setPreferences(c.preferences || '');
    setTotalBookings(c.totalBookings);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3 border border-[#183D35]/12 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">
            {editingId ? 'Edit Customer Profile' : 'Add Customer Profile'}
          </h3>
          {editingId && (
            <button type="button" onClick={reset} className="text-xs text-[#858078] underline">
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Customer Full Name *"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
            required
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+977 98XXXXXXXX *"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <input
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Voluntary Comfort Preferences"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <button type="submit" className="bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5]">
            {editingId ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </form>

      <div className="border border-[#183D35]/12 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">Customer Directory</h3>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            className="w-56 border border-[#183D35]/20 bg-[#FBF9F5] px-3 py-1.5 text-xs"
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#183D35]/15 text-[#858078]">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Preferences</th>
                <th className="py-2 pr-4 text-right">Visits</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#183D35]/10">
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 pr-4 font-medium text-[#183D35]">{c.fullName}</td>
                  <td className="py-3 pr-4 font-mono">{c.phone}</td>
                  <td className="py-3 pr-4 text-[#858078]">{c.preferences || '—'}</td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">{c.totalBookings}</td>
                  <td className="py-3 text-right space-x-3">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-[#183D35] underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCustomer(c.id)}
                      className="text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredGuestBookings.map((b) => (
                <tr key={`bk-${b.id}`} className="bg-[#F6F0E7]/30">
                  <td className="py-3 pr-4 font-medium text-[#183D35]">{b.customerName}</td>
                  <td className="py-3 pr-4 font-mono">{b.customerPhone}</td>
                  <td className="py-3 pr-4 text-[#858078]">{b.comfortPreferences || 'Booking Guest'}</td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">1 ({b.date})</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        saveCustomer({
                          id: `cust-${b.id}`,
                          fullName: b.customerName,
                          phone: b.customerPhone,
                          email: b.customerEmail,
                          preferredLanguage: b.preferredLanguage,
                          preferences: b.comfortPreferences,
                          totalBookings: 1,
                          lastVisitDate: b.date,
                        })
                      }
                      className="text-[#183D35] underline"
                    >
                      Save to CRM
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdminReportsSection: React.FC = () => {
  const { data: bookings = [] } = useGetAdminBookingsQuery();
  const { data: payments = [] } = useGetAdminPaymentsQuery();

  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    bookings.forEach((b) => counts.set(b.status, (counts.get(b.status) || 0) + 1));
    return ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map((st) => ({
      status: st,
      count: counts.get(st) || 0,
    }));
  }, [bookings]);

  const methodBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    bookings.forEach((b) => totals.set(b.paymentMethod, (totals.get(b.paymentMethod) || 0) + b.totalNpr));
    return ['cash', 'esewa', 'khalti', 'fonepay'].map((m) => ({
      method: m.toUpperCase(),
      npr: totals.get(m) || 0,
    }));
  }, [bookings]);

  const exportCsv = () => {
    const header = 'BookingRef,Date,StartTime,Category,Customer,Phone,Status,PaymentMethod,TotalNPR\n';
    const rows = bookings
      .map(
        (b) =>
          `"${b.bookingRef}","${b.date}","${b.startTime}","${b.category}","${b.customerName}","${b.customerPhone}","${b.status}","${b.paymentMethod}",${b.totalNpr}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healing-touch-bookings-${getKathmanduTodayIso()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#183D35]/12 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-medium text-[#183D35]">
              Operational Reports &amp; CSV Export
            </h3>
            <p className="text-xs text-[#858078]">
              Export appointment ledgers and review completion, couples, and Nepal gateway revenue ratios.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5]"
          >
            Download Bookings CSV
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4 text-xs">
          <div className="border border-[#183D35]/10 p-4">
            <p className="text-[#858078]">Total Records</p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#183D35]">{bookings.length}</p>
          </div>
          <div className="border border-[#183D35]/10 p-4">
            <p className="text-[#858078]">Gross Booked Value</p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#183D35]">
              {formatNpr(bookings.reduce((s, b) => s + b.totalNpr, 0))}
            </p>
          </div>
          <div className="border border-[#183D35]/10 p-4">
            <p className="text-[#858078]">Couples Bookings</p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#183D35]">
              {bookings.filter((b) => b.isCouple).length}
            </p>
          </div>
          <div className="border border-[#183D35]/10 p-4">
            <p className="text-[#858078]">Verified Payments</p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#183D35]">
              {payments.filter((p) => p.status === 'verified').length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-[#183D35]/12 bg-white p-6">
          <h4 className="font-display text-xl font-medium text-[#183D35]">Booking Status Distribution</h4>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DED2" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Appointments" fill="#183D35" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-[#183D35]/12 bg-white p-6">
          <h4 className="font-display text-xl font-medium text-[#183D35]">Booked Volume by Payment Method (NPR)</h4>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={methodBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DED2" />
                <XAxis dataKey="method" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="npr" name="NPR Value" fill="#C4A36A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
