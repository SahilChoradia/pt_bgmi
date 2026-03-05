"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { calculatePlacementPoints, calculateTotalPoints } from "@/utils/points";

interface Team {
  _id: string;
  teamName: string;
  shortName?: string;
  playerName?: string;
}

interface MatchResult {
  teamId: string;
  placement: number;
  kills: number;
}

interface MatchEntryProps {
  tournamentId: string;
  onMatchSubmitted: () => void;
}

export default function MatchEntry({ tournamentId, onMatchSubmitted }: MatchEntryProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matchNumber, setMatchNumber] = useState(1);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams();
  }, [tournamentId]);

  useEffect(() => {
    // Initialize results for all teams
    if (teams.length > 0) {
      setResults(
        teams.map((team) => ({
          teamId: team._id,
          placement: 16,
          kills: 0,
        }))
      );
    }
  }, [teams]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/teams?tournamentId=${tournamentId}`);
      const data = await response.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  const handleResultChange = (teamId: string, field: "placement" | "kills", value: number) => {
    setResults((prev) =>
      prev.map((result) =>
        result.teamId === teamId ? { ...result, [field]: value } : result
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          matchNumber,
          results,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMatchNumber((prev) => prev + 1);
        setResults(
          teams.map((team) => ({
            teamId: team._id,
            placement: 16,
            kills: 0,
          }))
        );
        onMatchSubmitted();
      } else {
        setError(data.error || "Failed to submit match");
      }
    } catch (err) {
      setError("Failed to submit match");
    } finally {
      setLoading(false);
    }
  };

  if (teams.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        Add teams first before entering matches
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="matchNumber" className="text-sm font-medium">
          Match Number:
        </label>
        <input
          id="matchNumber"
          type="number"
          value={matchNumber}
          onChange={(e) => setMatchNumber(parseInt(e.target.value) || 1)}
          className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
          min="1"
          required
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Team</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Placement</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Kills</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Placement Pts</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Kill Pts</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total Pts</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const result = results.find((r) => r.teamId === team._id);
              if (!result) return null;

              const placementPoints = calculatePlacementPoints(result.placement);
              const killPoints = result.kills;
              const totalPoints = calculateTotalPoints(result.placement, result.kills);

              return (
                <tr key={team._id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">{team.shortName || team.teamName.substring(0, 3).toUpperCase()}</div>
                      <div className="text-xs text-gray-400">{team.teamName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={result.placement}
                      onChange={(e) =>
                        handleResultChange(team._id, "placement", parseInt(e.target.value) || 16)
                      }
                      className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      min="1"
                      max="16"
                      required
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={result.kills}
                      onChange={(e) =>
                        handleResultChange(team._id, "kills", parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      min="0"
                      required
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-300">{placementPoints}</td>
                  <td className="px-4 py-3 text-gray-300">{killPoints}</td>
                  <td className="px-4 py-3 font-semibold text-yellow-400">{totalPoints}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-5 h-5" />
        {loading ? "Submitting..." : "Submit Match"}
      </button>
    </form>
  );
}

