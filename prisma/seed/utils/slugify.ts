import slugifyLib from 'slugify';

/**
 * Generates a URL-friendly slug from a string.
 */
export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}
