"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface TournamentFormProps {
  onTournamentCreated: (tournament: any) => void;
}

export default function TournamentForm({ onTournamentCreated }: TournamentFormProps) {
  const [tournamentName, setTournamentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentName }),
      });

      const data = await response.json();

      if (data.success) {
        setTournamentName("");
        onTournamentCreated(data.data);
      } else {
        setError(data.error || "Failed to create tournament");
      }
    } catch (err) {
      setError("Failed to create tournament");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tournamentName" className="block text-sm font-medium mb-2">
          Tournament Name
        </label>
        <input
          id="tournamentName"
          type="text"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
          placeholder="Enter tournament name"
          required
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-5 h-5" />
        {loading ? "Creating..." : "Create Tournament"}
      </button>
    </form>
  );
}


