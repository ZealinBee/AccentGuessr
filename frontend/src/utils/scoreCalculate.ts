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
    k?: number;
  } = {}
): number {
  const { maxScore = 5000, maxDistance = 20037.5, k = 1 } = opts;
  const guess = point([guessLng, guessLat]);

  // Check if guess is inside polygon
  let inside = false;
  if (region.geometry.type === "Polygon") {
    inside = booleanPointInPolygon(guess, region as ReturnType<typeof polygon>);
  } else if (region.geometry.type === "MultiPolygon") {
    // For MultiPolygon, check if point is in any of the polygons
    for (const polyCoords of region.geometry.coordinates) {
      const poly = polygon(polyCoords);
      if (booleanPointInPolygon(guess, poly)) {
        inside = true;
        break;
      }
    }
  }
  if (inside) return maxScore;

  // Compute minimum distance to any border (in km)
  let minDistanceKm = Infinity;

  if (region.geometry.type === "Polygon") {
    for (const ring of region.geometry.coordinates) {
      const line = lineString(ring);
      const d = pointToLineDistance(guess, line, { units: "kilometers" });
      if (d < minDistanceKm) minDistanceKm = d;
    }
  } else if (region.geometry.type === "MultiPolygon") {
    for (const poly of region.geometry.coordinates) {
      for (const ring of poly) {
        const line = lineString(ring);
        const d = pointToLineDistance(guess, line, { units: "kilometers" });
        if (d < minDistanceKm) minDistanceKm = d;
      }
    }
  }

  // Convert to score (logarithmic decay)
  const numerator = Math.log10(1 + k * minDistanceKm);
  const denominator = Math.log10(1 + k * maxDistance);
  const frac = Math.min(1, numerator / denominator);

  return Math.max(0, Math.round(maxScore * (1 - frac)));
}
