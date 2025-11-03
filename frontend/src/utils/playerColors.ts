/**
 * Generates consistent colors for players in multiplayer games.
 * The current player always gets a reddish color (#e74c3c).
 * Other players get assigned colors from a predefined palette based on their player ID.
 */

const PLAYER_COLORS = [
  "#3498db", // Blue
  "#9b59b6", // Purple
  "#f39c12", // Orange
  "#1abc9c", // Teal
  "#e67e22", // Dark Orange
  "#8e44ad", // Dark Purple
  "#2ecc71", // Green
];

const CURRENT_PLAYER_COLOR = "#16a085";

/**
 * Gets the color for a specific player.
 * @param playerId - The ID of the player
 * @param currentPlayerId - The ID of the current user
 * @returns A hex color string
 */
export function getPlayerColor(
  playerId: number,
  currentPlayerId: number | null
): string {
  // Current player always gets the red color
  if (playerId === currentPlayerId) {
    return CURRENT_PLAYER_COLOR;
  }

  // Other players get a consistent color based on their ID
  // Use modulo to cycle through colors if there are more players than colors
  const colorIndex = playerId % PLAYER_COLORS.length;
  return PLAYER_COLORS[colorIndex];
}

/**
 * Gets all player colors for the current match
 * @param playerIds - Array of all player IDs in the match
 * @param currentPlayerId - The ID of the current user
 * @returns Map of player IDs to their colors
 */
export function getPlayerColors(
  playerIds: number[],
  currentPlayerId: number | null
): Map<number, string> {
  const colorMap = new Map<number, string>();

  playerIds.forEach((playerId) => {
    colorMap.set(playerId, getPlayerColor(playerId, currentPlayerId));
  });

  return colorMap;
}
