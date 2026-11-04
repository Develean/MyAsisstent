const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

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
    // If not a valid ISO date, return the raw string as fallback
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
