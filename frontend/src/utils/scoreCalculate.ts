export function scoreCalculate(
  distanceKm: number,
  opts: {
    maxScore?: number;
    maxDistance?: number;
    k?: number;
  } = {}
): number {
  const { maxScore = 5000, maxDistance = 20037.5, k = 1 } = opts;

  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new Error("distanceKm must be a finite non-negative number");
  }

  if (distanceKm === 0) return maxScore;

  const numerator = Math.log10(1 + k * distanceKm);
  const denominator = Math.log10(1 + k * maxDistance);
  const frac = Math.min(1, numerator / denominator);

  return Math.max(0, Math.round(maxScore * (1 - frac)));
}
