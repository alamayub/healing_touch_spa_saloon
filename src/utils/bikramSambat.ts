// Bikram Sambat (BS) calendar conversion utility for Nepal (Asia/Kathmandu)
// Supports accurate Gregorian <-> Bikram Sambat display for 2024–2030 AD (2080–2087 BS)

const BS_MONTHS_EN = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

const BS_MONTHS_NE = [
  'वैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कात्तिक',
  'मंसिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत',
];

// Days per month for BS years 2080 to 2087
const BS_CALENDAR_DATA: Record<number, number[]> = {
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // starts 2023-04-14
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // starts 2024-04-13
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // starts 2025-04-14
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // starts 2026-04-14
  2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // starts 2027-04-14
  2085: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], // starts 2028-04-13
  2086: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // starts 2029-04-14
  2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // starts 2030-04-14
};

// Reference anchor: 2023-04-14 = 2080-01-01 BS
const ANCHOR_UTC_MS = Date.UTC(2023, 3, 14);

export interface BikramSambatDate {
  year: number;
  month: number; // 1-12
  day: number;
  monthNameEn: string;
  monthNameNe: string;
  formattedEn: string;
  formattedNe: string;
}

export function toBikramSambat(isoDate: string): BikramSambatDate | null {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [y, m, d] = parts;
  const targetMs = Date.UTC(y, m - 1, d);
  let diffDays = Math.floor((targetMs - ANCHOR_UTC_MS) / 86400000);
  if (diffDays < 0) return null;

  for (let bsYear = 2080; bsYear <= 2087; bsYear++) {
    const months = BS_CALENDAR_DATA[bsYear];
    if (!months) break;
    for (let mIdx = 0; mIdx < 12; mIdx++) {
      const daysInMonth = months[mIdx];
      if (diffDays < daysInMonth) {
        const bsDay = diffDays + 1;
        const monthNameEn = BS_MONTHS_EN[mIdx];
        const monthNameNe = BS_MONTHS_NE[mIdx];
        return {
          year: bsYear,
          month: mIdx + 1,
          day: bsDay,
          monthNameEn,
          monthNameNe,
          formattedEn: `${bsDay} ${monthNameEn} ${bsYear} BS`,
          formattedNe: `${toNepaliDigits(bsYear)} ${monthNameNe} ${toNepaliDigits(bsDay)}`,
        };
      }
      diffDays -= daysInMonth;
    }
  }
  return null;
}

export function toNepaliDigits(value: number | string): string {
  const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(value).replace(/[0-9]/g, (d) => digits[Number(d)]);
}
