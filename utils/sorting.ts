interface TeamLike {
  totalPoints: number;
  killPoints: number;
  placementPoints: number;
}

/**
 * Sort teams for leaderboard
 * 1. Higher Total Points
 * 2. Higher Placement Points
 * 3. Higher Kill Points (Finish Points)
 */
export function sortTeamsForLeaderboard<T extends TeamLike>(teams: T[]): T[] {
  return [...teams].sort((a, b) => {
    // First: Total Points (descending)
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    
    // Second: Placement Points (descending)
    if (b.placementPoints !== a.placementPoints) {
      return b.placementPoints - a.placementPoints;
    }
    
    // Third: Kill Points / Finish Points (descending)
    return b.killPoints - a.killPoints;
  });
}

