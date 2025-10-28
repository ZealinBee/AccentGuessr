interface Accent {
  id: number;
  name: string;
  region: number[][][] | number[][][][];
  description: string;
  type: "Polygon" | "MultiPolygon";
}

export type { Accent };
