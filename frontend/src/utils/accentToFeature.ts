import { polygon, multiPolygon } from "@turf/turf";
import type { Feature, Polygon, MultiPolygon } from "geojson";
import type { Accent } from "../types/Accent";

export function accentToFeature(
  accent: Accent
): Feature<Polygon | MultiPolygon> {
  function closeRing(ring: number[][]): number[][] {
    if (ring.length < 2) return ring;
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      return [...ring, first];
    }
    return ring;
  }

  if (accent.type === "Polygon") {
    const region = (accent.region as number[][][]).map(closeRing);
    return polygon(region);
  } else {
    const region = (accent.region as number[][][][]).map(
      (poly) => poly.map(closeRing)
    );
    return multiPolygon(region);
  }
}
