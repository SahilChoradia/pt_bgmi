"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";

interface Tournament {
  _id: string;
  tournamentName: string;
  createdAt: string;
}

interface TournamentSelectorProps {
  onTournamentSelect: (tournament: Tournament | null) => void;
  selectedTournament: Tournament | null;
}

export default function TournamentSelector({
  onTournamentSelect,
  selectedTournament,
}: TournamentSelectorProps) {
  const { data: session } = useSession();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, [session]);

  const fetchTournaments = async () => {
    try {
      // Use accessible endpoint for non-admin users to only see assigned tournaments
      const endpoint = session?.user?.role === 'admin' 
        ? "/api/tournaments" 
        : "/api/tournaments/accessible";
      
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.success) {
        setTournaments(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (tournament: Tournament) => {
    onTournamentSelect(tournament);
    setIsOpen(false);
  };

  if (loading) {
    return <div className="text-gray-400">Loading tournaments...</div>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors"
      >
        <span className="text-white">
          {selectedTournament ? selectedTournament.tournamentName : "Select Tournament"}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {tournaments.length === 0 ? (
              <div className="px-4 py-3 text-gray-400 text-sm">No tournaments found</div>
            ) : (
              tournaments.map((tournament) => (
                <button
                  key={tournament._id}
                  onClick={() => handleSelect(tournament)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  <div className="text-white font-medium">{tournament.tournamentName}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(tournament.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
