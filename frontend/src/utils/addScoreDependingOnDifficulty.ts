const addScoreDependingOnDifficulty = (
  baseScore: number,
  difficulty: number
): number => {
  const totalScore = 5000;
  const missingScore = totalScore - baseScore;

  let multiplier = 1;

  if (difficulty < 1000) {
    multiplier = 5;
  } else if (difficulty < 2000) {
    multiplier = 4;
  } else if (difficulty < 3000) {
    multiplier = 3;
  } else if (difficulty < 4000) {
    multiplier = 2;
  } else if (difficulty > 4000) {
    multiplier = 1;
  }

  return (missingScore * multiplier) / 10;
};

export default addScoreDependingOnDifficulty;
