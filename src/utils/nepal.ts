import { LanguageCode } from '../types/domain.ts';

export function formatNpr(amount: number, lang: LanguageCode = 'en'): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return lang === 'ne' ? `रु. ${formatted}` : `NPR ${formatted}`;
}

export function formatDuration(minutes: number, lang: LanguageCode = 'en'): string {
  if (minutes < 60) {
    return lang === 'ne' ? `${minutes} मिनेट` : `${minutes} min`;
  }
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return lang === 'ne' ? `${hrs} घण्टा` : `${hrs} hr`;
  }
  return lang === 'ne' ? `${hrs} घण्टा ${mins} मि.` : `${hrs} hr ${mins} min`;
}

export function getKathmanduTodayIso(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

export function isValidNepalPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+977|977)?9[678][0-9]{8}$/.test(cleaned) || /^(\+977|977)?0[1-9][0-9]{6,7}$/.test(cleaned);
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  const normalized = digits.startsWith('977') ? digits : `977${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDisplayTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function generateBookingRef(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HT-${yy}${mm}${dd}-${rand}`;
}
