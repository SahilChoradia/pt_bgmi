"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Team {
  _id: string;
  teamName: string;
  shortName?: string;
  playerName?: string;
  logoUrl?: string;
  matchesPlayed: number;
  wwcd: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
}

interface StreamerLeaderboardProps {
  tournamentId: string;
}

interface TeamWithRank extends Team {
  rank: number;
  previousRank?: number;
}

export default function StreamerLeaderboard({ tournamentId }: StreamerLeaderboardProps) {
  const [teams, setTeams] = useState<TeamWithRank[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(true);
  const previousRanksRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [tournamentId]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?tournamentId=${tournamentId}`);
      const data = await response.json();

      if (data.success) {
        setTournamentName(data.data.tournament.tournamentName);
        setTotalMatches(data.data.totalMatches);

        // Map teams with ranks and track previous ranks
        const teamsWithRanks: TeamWithRank[] = data.data.teams.map(
          (team: Team, index: number) => {
            const rank = index + 1;
            const previousRank = previousRanksRef.current.get(team._id);
            return {
              ...team,
              rank,
              previousRank: previousRank || rank,
            };
          }
        );

        // Update previous ranks
        teamsWithRanks.forEach((team) => {
          previousRanksRef.current.set(team._id, team.rank);
        });

        setTeams(teamsWithRanks);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400";
    if (rank === 3) return "bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700";
    return "bg-gray-800";
  };

  const getRankGlow = (rank: number) => {
    if (rank === 1) return "shadow-[0_0_20px_rgba(255,215,0,0.5)]";
    if (rank === 2) return "shadow-[0_0_20px_rgba(192,192,192,0.5)]";
    if (rank === 3) return "shadow-[0_0_20px_rgba(205,127,50,0.5)]";
    return "";
  };

  const getRankChange = (team: TeamWithRank) => {
    if (!team.previousRank || team.previousRank === team.rank) {
      return { icon: Minus, color: "text-gray-400", text: "" };
    }
    if (team.previousRank > team.rank) {
      return { icon: TrendingUp, color: "text-green-400", text: `+${team.previousRank - team.rank}` };
    }
    return { icon: TrendingDown, color: "text-red-400", text: `-${team.rank - team.previousRank}` };
  };

  if (loading && teams.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400 text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Tournament Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
          {tournamentName}
        </h1>
        <div className="text-2xl text-gray-300 font-semibold">
          MATCH {totalMatches}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-800">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 border-b-2 border-gray-700">
                <th className="px-6 py-4 text-left text-xl font-bold text-gray-300">Rank</th>
                <th className="px-6 py-4 text-left text-xl font-bold text-gray-300">Team</th>
                <th className="px-6 py-4 text-center text-xl font-bold text-gray-300">Matches</th>
                <th className="px-6 py-4 text-center text-xl font-bold text-gray-300">WWCD</th>
                <th className="px-6 py-4 text-center text-xl font-bold text-gray-300">Placement Pts</th>
                <th className="px-6 py-4 text-center text-xl font-bold text-gray-300">Kill Pts</th>
                <th className="px-6 py-4 text-center text-xl font-bold text-gray-300">Total Pts</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {teams.map((team, index) => {
                  const rankChange = getRankChange(team);
                  const RankIcon = rankChange.icon;
                  const isRankChanged = team.previousRank && team.previousRank !== team.rank;

                  return (
                    <motion.tr
                      key={team._id}
                      layout
                      initial={isRankChanged ? { opacity: 0, y: team.previousRank! > team.rank ? -50 : 50 } : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ 
                        duration: 0.5,
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                      className={`${getRankColor(team.rank)} ${getRankGlow(team.rank)} border-b border-gray-700 last:border-b-0`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold text-white">
                            {team.rank === 1 ? "🥇" : team.rank === 2 ? "🥈" : team.rank === 3 ? "🥉" : team.rank}
                          </span>
                          {team.previousRank && team.previousRank !== team.rank && (
                            <RankIcon className={`w-5 h-5 ${rankChange.color}`} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {team.logoUrl ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                              <img
                                src={team.logoUrl}
                                alt={team.shortName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                              {(team.shortName || team.teamName).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-2xl font-bold text-white">{team.shortName || team.teamName.substring(0, 3).toUpperCase()}</div>
                            <div className="text-sm text-gray-200 opacity-80">{team.teamName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-xl text-white font-semibold">
                        {team.matchesPlayed}
                      </td>
                      <td className="px-6 py-4 text-center text-xl text-white font-semibold">
                        {team.wwcd}
                      </td>
                      <td className="px-6 py-4 text-center text-xl text-white font-semibold">
                        {team.placementPoints}
                      </td>
                      <td className="px-6 py-4 text-center text-xl text-white font-semibold">
                        {team.killPoints}
                      </td>
                      <td className="px-6 py-4 text-center text-2xl text-white font-bold">
                        {team.totalPoints}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

