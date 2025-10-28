import {
  booleanPointInPolygon,
  lineString,
  multiPolygon,
  point,
  pointToLineDistance,
  polygon,
} from "@turf/turf";

export function scoreCalculate(
  guessLat: number,
  guessLng: number,
  region: ReturnType<typeof polygon> | ReturnType<typeof multiPolygon>,
  opts: {
    maxScore?: number;
    maxDistance?: number;
    softness?: number; // how wide the soft zone is (km)
    sharpness?: number; // how steep the drop is after soft zone
  } = {}
): number {
  const {
    maxScore = 5000,
    softness = 1000, // forgiving until about 1000 km
    sharpness = 2.2, // higher = steeper drop
  } = opts;

  const guess = point([guessLng, guessLat]);

  // Check if inside region
  let inside = false;
  if (region.geometry.type === "Polygon") {
    inside = booleanPointInPolygon(guess, region as ReturnType<typeof polygon>);
  } else if (region.geometry.type === "MultiPolygon") {
    for (const polyCoords of region.geometry.coordinates) {
      const poly = polygon(polyCoords);
      if (booleanPointInPolygon(guess, poly)) {
        inside = true;
        break;
      }
    }
  }
  if (inside) return maxScore;

  // Compute minimum distance (km)
  let minDistanceKm = Infinity;
  if (region.geometry.type === "Polygon") {
    for (const ring of region.geometry.coordinates) {
      const d = pointToLineDistance(guess, lineString(ring), { units: "kilometers" });
      if (d < minDistanceKm) minDistanceKm = d;
    }
  } else if (region.geometry.type === "MultiPolygon") {
    for (const poly of region.geometry.coordinates) {
      for (const ring of poly) {
        const d = pointToLineDistance(guess, lineString(ring), { units: "kilometers" });
        if (d < minDistanceKm) minDistanceKm = d;
      }
    }
  }

  // --- New distance-to-score mapping ---
  // Smooth sigmoid curve centered around ~1000 km
  const x = minDistanceKm / softness;
  const frac = 1 / (1 + Math.exp(-sharpness * (1.5 - x))); // stays high until x≈1, drops fast after

  const score = maxScore * frac;
  return Math.max(0, Math.round(score));
}