const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

const DAYS_FULL = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

/**
 * Returns YYYY-MM-DD string for today or offset days from today
 */
export const getDateOnlyString = (daysOffset = 0): string => {
  const d = new Date();
  if (daysOffset !== 0) {
    d.setDate(d.getDate() + daysOffset);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Formats a YYYY-MM-DD or ISO string to Indonesian human date:
 * e.g. "Kamis, 5 Nov 2026"
 */
export const formatIndonesianFullDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const parsed = new Date(dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr);
  if (isNaN(parsed.getTime())) return dateStr;

  const dayName = DAYS_FULL[parsed.getDay()];
  const dateNum = parsed.getDate();
  const monthName = MONTHS_SHORT[parsed.getMonth()];
  const year = parsed.getFullYear();
  return `${dayName}, ${dateNum} ${monthName} ${year}`;
};

/**
 * Calculates days remaining from today until targetDate (YYYY-MM-DD or ISO).
 */
export const calculateDaysLeft = (targetDateStr: string): number => {
  if (!targetDateStr) return 0;
  const parts = targetDateStr.split('T')[0].split('-').map(Number);
  if (parts.length < 3) return 0;

  const targetUTC = Date.UTC(parts[0], parts[1] - 1, parts[2]);
  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = targetUTC - todayUTC;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Returns an ISO 8601 string for tomorrow at 23:59:00.
 */
export const getDefaultTomorrowDeadlineISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
};

/**
 * Returns an ISO 8601 string for offset days with specific hours:minutes
 */
export const getCustomDeadlineISO = (daysOffset: number, hours = 23, minutes = 59): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

/**
 * Returns an ISO 8601 string for end of current week (Sunday 23:59).
 */
export const getEndOfWeekDeadlineISO = (): string => {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
};

/**
 * Formats an ISO 8601 date string into human-friendly Indonesian text.
 * e.g. "Besok, 23:59", "Hari ini, 14:00", "5 Nov, 20:00"
 */
export const formatDeadlineDisplay = (isoStr?: string | null): string => {
  if (!isoStr) return 'Hari ini';

  const date = new Date(isoStr);
  if (isNaN(date.getTime())) {
    return isoStr;
  }

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday) {
    return `Hari ini, ${timeStr}`;
  }
  if (isTomorrow) {
    return `Besok, ${timeStr}`;
  }

  const d = date.getDate();
  const m = MONTHS_SHORT[date.getMonth()];
  return `${d} ${m}, ${timeStr}`;
};

/**
 * Formats date into "d MMM YYYY"
 */
export const formatShortDate = (isoStr?: string | null): string => {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return isoStr;
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
};
