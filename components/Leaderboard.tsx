"use client";

import { useEffect, useState } from "react";
import { sortTeamsForLeaderboard } from "@/utils/sorting";

interface Team {
  _id: string;
  teamName: string;
  shortName?: string;
  playerName?: string;
  matchesPlayed: number;
  wwcd: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
}

interface LeaderboardProps {
  tournamentId: string;
  refreshTrigger: number;
}

export default function Leaderboard({ tournamentId, refreshTrigger }: LeaderboardProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [tournamentId, refreshTrigger]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/teams?tournamentId=${tournamentId}`);
      const data = await response.json();
      if (data.success) {
        const sortedTeams = sortTeamsForLeaderboard<Team>(data.data);
        setTeams(sortedTeams);
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-600 to-yellow-800 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
    if (rank === 3) return "bg-gradient-to-r from-orange-700 to-orange-900 text-white";
    return "bg-gray-800 text-gray-200";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  if (loading) {
    return <div className="text-gray-400">Loading leaderboard...</div>;
  }

  if (teams.length === 0) {
    return <div className="text-gray-400 text-center py-8">No teams yet</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 border-b-2 border-gray-700">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Rank</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Short Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Team Name</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Matches</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">WWCD</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Placement Pts</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Kill Pts</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Total Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => {
            const rank = index + 1;
            return (
              <tr
                key={team._id}
                className={`border-b border-gray-700 ${getRankColor(rank)} hover:opacity-90 transition-opacity`}
              >
                <td className="px-4 py-3 font-bold text-lg">{getRankIcon(rank)}</td>
                <td className="px-4 py-3 font-semibold">{team.shortName || team.teamName.substring(0, 3).toUpperCase()}</td>
                <td className="px-4 py-3">
                  <div>
                    <div>{team.teamName}</div>
                    {team.playerName && (
                      <div className="text-xs opacity-75">{team.playerName}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{team.matchesPlayed}</td>
                <td className="px-4 py-3 text-center font-semibold">{team.wwcd}</td>
                <td className="px-4 py-3 text-center">{team.placementPoints}</td>
                <td className="px-4 py-3 text-center">{team.killPoints}</td>
                <td className="px-4 py-3 text-center font-bold text-lg">{team.totalPoints}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

