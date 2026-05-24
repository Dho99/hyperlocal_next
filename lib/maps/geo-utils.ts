/**
 * Safely parses a coordinate (latitude or longitude) to a number.
 * Handles Decimal, string, or number types.
 */
export function parseCoordinate(coord: any): number | null {
  if (coord === null || coord === undefined || coord === "") return null;
  
  const parsed = typeof coord === 'string' ? parseFloat(coord) : Number(coord);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Checks if a set of coordinates is valid for Leaflet.
 */
export function isValidCoordinate(lat: number | null, lng: number | null): boolean {
  if (lat === null || lng === null) return false;
  
  return (
    lat >= -90 && 
    lat <= 90 && 
    lng >= -180 && 
    lng <= 180
  );
}

/**
 * Default map center (e.g., center of Indonesia or a specific region)
 */
export const DEFAULT_CENTER: [number, number] = [-7.3274, 108.2207]; // Tasikmalaya/Banjar area
export const DEFAULT_ZOOM = 13;
