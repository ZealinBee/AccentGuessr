/**
 * Generates consistent colors for players in multiplayer games.
 * The current player always gets a reddish color (#e74c3c).
 * Other players get assigned colors from a predefined palette based on their player ID.
 */

const PLAYER_COLORS = [
  "#8e44ad", // Dark Purple
  "#d35400", // Pumpkin
  "#c0392b", // Dark Red
  "#ffd93d", // Yellow
  "#ee5a6f", // Rose
  "#fd79a8", // Light Pink
  "#fab1a0", // Peach
];

const CURRENT_PLAYER_COLOR = "#3498db";

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
