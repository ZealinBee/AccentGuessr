interface Accent {
  id: number;
  name: string;
  region: number[][][] | number[][][][];
  type: "Polygon" | "MultiPolygon";
}

export type { Accent };
