"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import StreamerRow from "./StreamerRow";
import { sortTeamsForLeaderboard } from "@/utils/sorting";

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

interface VerticalStreamerLeaderboardProps {
  tournamentId: string;
}

interface TeamWithRank extends Team {
  rank: number;
  previousRank?: number;
}

export default function VerticalStreamerLeaderboard({
  tournamentId,
}: VerticalStreamerLeaderboardProps) {
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

  if (loading && teams.length === 0) {
    return (
      <div className="fixed right-0 top-0 w-[340px] h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center border-l border-gray-800">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 w-[340px] h-screen bg-gradient-to-b from-[#1a0a0a] via-[#0d0505] to-black border-l-2 border-red-800/60 overflow-hidden flex flex-col shadow-2xl">
      {/* Header Section */}
      <div className="px-3 py-1 border-b border-red-900/30 bg-gradient-to-r from-red-900/30 via-red-800/20 to-transparent">
        <h1 className="text-base font-bold text-white truncate drop-shadow-lg">
          {tournamentName}
        </h1>
        <div className="text-xs text-red-300 font-semibold">
          MATCH {totalMatches}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-hidden px-2 py-1">
        {/* Header Row */}
        <div className="flex items-center gap-1.5 mb-1 px-2 py-1 bg-red-900/20 border border-red-800/30 rounded h-[32px]">
          <div className="w-[40px] flex-shrink-0"></div>
          <div className="w-6 flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
              Team
            </div>
          </div>
          <div className="w-[35px] text-right flex-shrink-0">
            <div className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
              PP
            </div>
          </div>
          <div className="w-[35px] text-right flex-shrink-0">
            <div className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
              FP
            </div>
          </div>
          <div className="w-[45px] text-right flex-shrink-0">
            <div className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
              TP
            </div>
          </div>
        </div>

        <div className="space-y-0">
          <AnimatePresence mode="popLayout">
            {teams.map((team) => (
              <StreamerRow
                key={team._id}
                rank={team.rank}
                teamShortName={team.shortName || team.teamName.substring(0, 3).toUpperCase()}
                placementPoints={team.placementPoints}
                finishPoints={team.killPoints}
                totalPoints={team.totalPoints}
                isTopThree={team.rank <= 3}
                logoUrl={team.logoUrl}
                previousRank={team.previousRank}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="px-2 py-1 border-t border-red-900/30 bg-gradient-to-r from-red-900/10 to-transparent">
        <div className="text-[10px] text-gray-500 text-center">
          BGMI Tournament Leaderboard
        </div>
      </div>
    </div>
  );
}

