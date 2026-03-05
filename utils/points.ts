/**
 * Calculate placement points based on BGMI scoring system
 */
export function calculatePlacementPoints(placement: number): number {
  const pointsMap: { [key: number]: number } = {
    1: 10,
    2: 6,
    3: 5,
    4: 4,
    5: 3,
    6: 2,
    7: 1,
    8: 1,
  };

  return pointsMap[placement] || 0;
}

/**
 * Calculate kill points (1 kill = 1 point)
 */
export function calculateKillPoints(kills: number): number {
  return kills;
}

/**
 * Calculate total points
 */
export function calculateTotalPoints(placement: number, kills: number): number {
  const placementPoints = calculatePlacementPoints(placement);
  const killPoints = calculateKillPoints(kills);
  return placementPoints + killPoints;
}


