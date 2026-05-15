import L from "leaflet";

// Import images from leaflet package
// Note: We use relative paths that point to the node_modules structure
// that is accessible to the Next.js bundler.
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/**
 * Fixes Leaflet's default icon paths which are often broken in Next.js / Webpack
 * build environments. This should be called once before any map is rendered.
 */
export function fixLeafletIcons() {
    L.Icon.Default.mergeOptions({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
    });
}
