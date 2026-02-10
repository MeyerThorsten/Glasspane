/**
 * Date-shifting utility for mock data.
 *
 * All mock JSON dates are anchored to ANCHOR_DATE. This module shifts them
 * forward by the elapsed time so data always appears current.
 */

export const ANCHOR_DATE = new Date("2026-02-10T00:00:00Z");

/** Full days elapsed since the anchor date (clamped to >= 0). */
export function getDaysDelta(): number {
  const now = Date.now();
  const delta = Math.floor((now - ANCHOR_DATE.getTime()) / 86_400_000);
  return Math.max(0, delta);
}

/** Calendar months elapsed since the anchor date. */
export function getMonthsDelta(): number {
  const now = new Date();
  const years = now.getUTCFullYear() - ANCHOR_DATE.getUTCFullYear();
  const months = now.getUTCMonth() - ANCHOR_DATE.getUTCMonth();
  return Math.max(0, years * 12 + months);
}

/** Shift an ISO 8601 timestamp (e.g. "2026-01-15T08:30:00Z") forward by the day delta. */
export function shiftISODate(isoString: string): string {
  const delta = getDaysDelta();
  if (delta === 0) return isoString;
  const d = new Date(isoString);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString();
}

/** Null-safe wrapper around shiftISODate. */
export function shiftISODateNullable(isoString: string | null): string | null {
  if (isoString === null) return null;
  return shiftISODate(isoString);
}

/** Shift a YYYY-MM-DD date string forward by the day delta. */
export function shiftDate(dateString: string): string {
  const delta = getDaysDelta();
  if (delta === 0) return dateString;
  const d = new Date(dateString + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Shift a YYYY-MM month string forward by the month delta. */
export function shiftMonth(monthString: string): string {
  const delta = getMonthsDelta();
  if (delta === 0) return monthString;
  const [year, month] = monthString.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Days from today until the given YYYY-MM-DD expiry date (clamped to >= 0). */
export function computeDaysUntilExpiry(shiftedExpiresAt: string): number {
  const expiry = new Date(shiftedExpiresAt + "T00:00:00Z").getTime();
  const today = new Date();
  const todayMidnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const days = Math.floor((expiry - todayMidnight) / 86_400_000);
  return Math.max(0, days);
}

/** Derive certificate status from days until expiry. */
export function computeCertificateStatus(
  daysUntilExpiry: number
): "valid" | "expiring-soon" | "expired" {
  if (daysUntilExpiry <= 0) return "expired";
  if (daysUntilExpiry <= 30) return "expiring-soon";
  return "valid";
}
