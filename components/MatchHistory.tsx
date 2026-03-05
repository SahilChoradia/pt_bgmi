"use client";

import { useEffect, useState } from "react";

interface MatchResult {
  teamId: {
    _id: string;
    teamName: string;
    shortName?: string;
  } | string;
  placement: number;
  kills: number;
  placementPoints: number;
  totalPoints: number;
}

interface Match {
  _id: string;
  matchNumber: number;
  results: MatchResult[];
}

interface MatchHistoryProps {
  tournamentId: string;
  refreshTrigger: number;
}

export default function MatchHistory({ tournamentId, refreshTrigger }: MatchHistoryProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [tournamentId, refreshTrigger]);

  const fetchMatches = async () => {
    try {
      const response = await fetch(`/api/matches?tournamentId=${tournamentId}`);
      const data = await response.json();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading match history...</div>;
  }

  if (matches.length === 0) {
    return <div className="text-gray-400 text-center py-8">No matches played yet</div>;
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        // Sort results by placement
        const sortedResults = [...match.results].sort((a, b) => a.placement - b.placement);

        return (
          <div key={match._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              Match #{match.matchNumber}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-700 border-b border-gray-600">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300">Rank</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300">Team</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300">Placement</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300">Kills</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((result, index) => {
                    const team = typeof result.teamId === 'object' ? result.teamId : null;
                    if (!team) return null;
                    
                    return (
                      <tr
                        key={team._id}
                        className="border-b border-gray-700 hover:bg-gray-750"
                      >
                        <td className="px-3 py-2 text-gray-300">{index + 1}</td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-white">{team.shortName || team.teamName.substring(0, 3).toUpperCase()}</div>
                          <div className="text-xs text-gray-400">{team.teamName}</div>
                        </td>
                        <td className="px-3 py-2 text-center text-gray-300">{result.placement}</td>
                        <td className="px-3 py-2 text-center text-gray-300">{result.kills}</td>
                        <td className="px-3 py-2 text-center font-semibold text-yellow-400">
                          {result.totalPoints}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

