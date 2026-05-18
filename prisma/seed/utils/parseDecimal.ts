/**
 * Safely parses a string to a number for Decimal fields.
 */
export function parseDecimal(value: string | undefined | null): number | null {
  if (!value) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}
