interface TeamLike {
  totalPoints: number;
  killPoints: number;
  placementPoints: number;
}

/**
 * Sort teams for leaderboard
 * 1. Higher Total Points
 * 2. Higher Kill Points
 * 3. Higher Placement Points
 */
export function sortTeamsForLeaderboard<T extends TeamLike>(teams: T[]): T[] {
  return [...teams].sort((a, b) => {
    // First: Total Points (descending)
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    
    // Second: Kill Points (descending)
    if (b.killPoints !== a.killPoints) {
      return b.killPoints - a.killPoints;
    }
    
    // Third: Placement Points (descending)
    return b.placementPoints - a.placementPoints;
  });
}

