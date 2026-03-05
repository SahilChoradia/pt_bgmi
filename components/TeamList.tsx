"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";

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

interface TeamListProps {
  tournamentId: string;
  onTeamUpdated: () => void;
}

export default function TeamList({ tournamentId, onTeamUpdated }: TeamListProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ teamName: "", shortName: "", playerName: "", logoUrl: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [tournamentId]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/teams?tournamentId=${tournamentId}`);
      const data = await response.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      const response = await fetch(`/api/teams?teamId=${teamId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchTeams();
        onTeamUpdated();
      }
    } catch (err) {
      console.error("Failed to delete team:", err);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingId(team._id);
    setEditForm({
      teamName: team.teamName,
      shortName: team.shortName || "",
      playerName: team.playerName || "",
      logoUrl: team.logoUrl || "",
    });
  };

  const handleSaveEdit = async (teamId: string) => {
    try {
      const response = await fetch("/api/teams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          teamName: editForm.teamName.trim(),
          shortName: editForm.shortName.trim() || undefined,
          playerName: editForm.playerName.trim() || undefined,
          logoUrl: editForm.logoUrl.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingId(null);
        fetchTeams();
        onTeamUpdated();
      }
    } catch (err) {
      console.error("Failed to update team:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ teamName: "", shortName: "", playerName: "", logoUrl: "" });
  };

  if (loading) {
    return <div className="text-gray-400">Loading teams...</div>;
  }

  if (teams.length === 0) {
    return <div className="text-gray-400 text-center py-8">No teams added yet</div>;
  }

  return (
    <div className="space-y-2">
      {teams.map((team) => (
        <div
          key={team._id}
          className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg"
        >
          {editingId === team._id ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                value={editForm.teamName}
                onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value })}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Team Name"
              />
              <input
                type="text"
                value={editForm.shortName}
                onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value.toUpperCase() })}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Short Name"
                maxLength={10}
              />
              <input
                type="text"
                value={editForm.playerName}
                onChange={(e) => setEditForm({ ...editForm, playerName: e.target.value })}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Player Name"
              />
              <input
                type="url"
                value={editForm.logoUrl}
                onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                placeholder="Logo URL (optional)"
              />
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-center gap-4">
                {team.shortName && (
                  <span className="font-semibold text-white">{team.shortName}</span>
                )}
                <span className="text-gray-300">{team.teamName}</span>
                {team.playerName && (
                  <span className="text-gray-400 text-sm">({team.playerName})</span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {editingId === team._id ? (
              <>
                <button
                  onClick={() => handleSaveEdit(team._id)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(team)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(team._id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

