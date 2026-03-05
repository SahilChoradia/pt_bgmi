"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface AddTeamFormProps {
  tournamentId: string;
  onTeamAdded: () => void;
}

export default function AddTeamForm({ tournamentId, onTeamAdded }: AddTeamFormProps) {
  const [teamName, setTeamName] = useState("");
  const [shortName, setShortName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          teamName: teamName.trim(),
          shortName: shortName.trim() || undefined,
          playerName: playerName.trim() || undefined,
          logoUrl: logoUrl.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTeamName("");
        setShortName("");
        setPlayerName("");
        setLogoUrl("");
        onTeamAdded();
      } else {
        setError(data.error || "Failed to add team");
      }
    } catch (err) {
      setError("Failed to add team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium mb-2">
            Team Name
          </label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
            placeholder="Team Name"
            required
          />
        </div>
        <div>
          <label htmlFor="shortName" className="block text-sm font-medium mb-2">
            Short Name (Optional)
          </label>
          <input
            id="shortName"
            type="text"
            value={shortName}
            onChange={(e) => setShortName(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
            placeholder="Optional tag (example: SOUL)"
            maxLength={10}
          />
        </div>
        <div>
          <label htmlFor="playerName" className="block text-sm font-medium mb-2">
            Player Name (Optional)
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
            placeholder="Optional player name"
          />
        </div>
      </div>
      <div>
        <label htmlFor="logoUrl" className="block text-sm font-medium mb-2">
          Team Logo URL (Optional)
        </label>
        <input
          id="logoUrl"
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
          placeholder="https://example.com/logo.png"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-5 h-5" />
        {loading ? "Adding..." : "Add Team"}
      </button>
    </form>
  );
}

