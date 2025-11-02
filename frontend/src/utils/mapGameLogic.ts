import { point, booleanPointInPolygon, lineString, nearestPointOnLine, distance } from "@turf/turf";

export function checkIfInsideRegion(guess: { lng: number; lat: number }, regionFeature: GeoJSON.Feature) {
  return booleanPointInPolygon(point([guess.lng, guess.lat]), regionFeature);
}

export function getClosestBorderPoint(guess: { lng: number; lat: number }, regionFeature: any) {
  const guessPt = point([guess.lng, guess.lat]);
  let closest: any = null;
  let minDist = Infinity;

  if (regionFeature.geometry.type === "Polygon") {
    for (const ring of regionFeature.geometry.coordinates) {
      const snap = nearestPointOnLine(lineString(ring), guessPt);
      const distVal = distance(guessPt, snap, { units: "kilometers" });
      if (distVal < minDist) {
        minDist = distVal;
        closest = snap;
      }
    }
  } else if (regionFeature.geometry.type === "MultiPolygon") {
    for (const poly of regionFeature.geometry.coordinates) {
      for (const ring of poly) {
        const snap = nearestPointOnLine(lineString(ring), guessPt);
        const distVal = distance(guessPt, snap, { units: "kilometers" });
        if (distVal < minDist) {
          minDist = distVal;
          closest = snap;
        }
      }
    }
  }

  if (!closest) return null;

  return {
    lng: closest.geometry.coordinates[0],
    lat: closest.geometry.coordinates[1],
    distanceKm: minDist,
  };
}
