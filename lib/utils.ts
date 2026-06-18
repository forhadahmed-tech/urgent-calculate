/**
 * Utility functions for UrgentCalculate
 */

/** Format a number with commas and fixed decimals */
export function formatNumber(n: number, decimals = 2): string {
  if (isNaN(n) || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a number as currency */
export function formatCurrency(n: number, symbol = "$"): string {
  return `${symbol}${formatNumber(n, 2)}`;
}

/** Format a percentage */
export function formatPercent(n: number, decimals = 2): string {
  return `${formatNumber(n, decimals)}%`;
}

/** Parse a safe float from string input */
export function safeFloat(val: string | undefined | null, fallback = 0): number {
  const n = parseFloat(val ?? "");
  return isNaN(n) ? fallback : n;
}

/** Parse a safe integer from string input */
export function safeInt(val: string | undefined | null, fallback = 0): number {
  const n = parseInt(val ?? "", 10);
  return isNaN(n) ? fallback : n;
}

/** Add `n` days to a date */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Format a Date to a readable string */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Greatest Common Divisor (Euclidean algorithm) */
export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/** Least Common Multiple */
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/** Clamp a number between min and max */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Copy text to clipboard, returns success boolean */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Share via Web Share API or fallback to clipboard copy */
export async function share(data: {
  title: string;
  text?: string;
  url: string;
}): Promise<"shared" | "copied" | "failed"> {
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(data);
      return "shared";
    }
    const ok = await copyToClipboard(data.url);
    return ok ? "copied" : "failed";
  } catch {
    return "failed";
  }
}

/** Slugify a string for URL usage */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** Truncate a string to maxLength with ellipsis */
export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
