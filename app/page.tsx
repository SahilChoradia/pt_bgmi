"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import TournamentForm from "@/components/TournamentForm";
import TournamentSelector from "@/components/TournamentSelector";
import AddTeamForm from "@/components/AddTeamForm";
import TeamList from "@/components/TeamList";
import MatchEntry from "@/components/MatchEntry";
import Leaderboard from "@/components/Leaderboard";
import MatchHistory from "@/components/MatchHistory";
import { Download, RotateCcw, Video, LogIn } from "lucide-react";
import Link from "next/link";

interface Tournament {
  _id: string;
  tournamentName: string;
  createdAt: string;
}

function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showMatchEntry, setShowMatchEntry] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isAdmin = session?.user?.role === 'admin';
  const isEditor = session?.user?.role === 'editor';
  const canEdit = isAdmin || isEditor;
  const canCreateTournament = isAdmin || isEditor;

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Handle tournament selection and action from URL
  useEffect(() => {
    const tournamentId = searchParams.get('tournamentId');
    const action = searchParams.get('action');

    // Handle create action
    if (action === 'create' && status === 'authenticated' && canCreateTournament) {
      setShowTournamentForm(true);
      return;
    }

    if (tournamentId && status === 'authenticated') {
      // Fetch the tournament details
      fetch(`/api/tournaments`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const tournament = data.data.find((t: Tournament) => t._id === tournamentId);
            if (tournament) {
              setSelectedTournament(tournament);
              
              // Handle action parameters after tournament is selected
              if (action === 'teams') {
                setShowTeamForm(true);
              } else if (action === 'match') {
                setShowMatchEntry(true);
              }
            }
          }
        })
        .catch(console.error);
    }
  }, [searchParams, status, canCreateTournament]);

  const handleTournamentCreated = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setShowTournamentForm(false);
  };

  const handleTournamentSelect = (tournament: Tournament | null) => {
    setSelectedTournament(tournament);
    setShowTeamForm(false);
    setShowMatchEntry(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTeamUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleMatchSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleExportCSV = async () => {
    if (!selectedTournament) return;

    try {
      const response = await fetch(`/api/teams?tournamentId=${selectedTournament._id}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        // Sort teams for leaderboard
        const sortedTeams = [...data.data].sort((a: any, b: any) => {
          if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
          if (b.killPoints !== a.killPoints) return b.killPoints - a.killPoints;
          return b.placementPoints - a.placementPoints;
        });

        // Create CSV content
        const headers = [
          "Rank",
          "Short Name",
          "Team Name",
          "Player Name",
          "Matches",
          "WWCD",
          "Placement Points",
          "Kill Points",
          "Total Points",
        ];

        const rows = sortedTeams.map((team: any, index: number) => [
          index + 1,
          team.shortName,
          team.teamName,
          team.playerName,
          team.matchesPlayed,
          team.wwcd,
          team.placementPoints,
          team.killPoints,
          team.totalPoints,
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${selectedTournament.tournamentName}_leaderboard.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Failed to export CSV:", err);
      alert("Failed to export CSV");
    }
  };

  const handleResetTournament = async () => {
    if (!selectedTournament) return;

    if (
      !confirm(
        "Are you sure you want to reset this tournament? All match data will be deleted, but teams will be kept."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/teams/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: selectedTournament._id }),
      });

      const data = await response.json();
      if (data.success) {
        setRefreshTrigger((prev) => prev + 1);
        alert("Tournament reset successfully!");
      } else {
        alert(data.error || "Failed to reset tournament");
      }
    } catch (err) {
      console.error("Failed to reset tournament:", err);
      alert("Failed to reset tournament");
    }
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to continue</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Check if user can access this page (only admin and editor)
  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">You don&apos;t have permission to manage tournaments.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Step 1: Tournament Selection */}
        <section className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Step 1: Select or Create Tournament</h2>

            {!selectedTournament ? (
              <div className="space-y-4">
                {canCreateTournament && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowTournamentForm(!showTournamentForm)}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      {showTournamentForm ? "Cancel" : "Create New Tournament"}
                    </button>
                  </div>
                )}

                {showTournamentForm && canCreateTournament && (
                  <div className="mt-4">
                    <TournamentForm onTournamentCreated={handleTournamentCreated} />
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-gray-400 mb-2">
                    {canCreateTournament ? "Or select an existing tournament:" : "Select a tournament:"}
                  </p>
                  <TournamentSelector
                    onTournamentSelect={handleTournamentSelect}
                    selectedTournament={selectedTournament}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Current Tournament: {selectedTournament.tournamentName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Created: {new Date(selectedTournament.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTournament(null);
                    setShowTeamForm(false);
                    setShowMatchEntry(false);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Change Tournament
                </button>
              </div>
            )}
          </div>
        </section>

        {selectedTournament && (
          <>
            {/* Step 2: Team Registration */}
            <section className="mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Step 2: Team Registration</h2>
                  <button
                    onClick={() => setShowTeamForm(!showTeamForm)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    {showTeamForm ? "Hide Form" : "Add Team"}
                  </button>
                </div>

                {showTeamForm && (
                  <div className="mb-6">
                    <AddTeamForm
                      tournamentId={selectedTournament._id}
                      onTeamAdded={() => {
                        handleTeamUpdated();
                        setShowTeamForm(false);
                      }}
                    />
                  </div>
                )}

                <TeamList
                  tournamentId={selectedTournament._id}
                  onTeamUpdated={handleTeamUpdated}
                />
              </div>
            </section>

            {/* Step 3: Start Tournament / Match Entry */}
            <section className="mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Step 3: Enter Matches</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedTournament) {
                          window.open(`/stream?tournamentId=${selectedTournament._id}`, "_blank");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Open Streamer Mode
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    {/* Reset Tournament button - Admin only */}
                    {isAdmin && (
                      <button
                        onClick={handleResetTournament}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Tournament
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <button
                    onClick={() => setShowMatchEntry(!showMatchEntry)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    {showMatchEntry ? "Hide Match Entry" : "Start Tournament / Enter Match"}
                  </button>
                </div>

                {showMatchEntry && (
                  <MatchEntry
                    tournamentId={selectedTournament._id}
                    onMatchSubmitted={handleMatchSubmitted}
                  />
                )}
              </div>
            </section>

            {/* Leaderboard */}
            <section className="mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Live Leaderboard</h2>
                <Leaderboard
                  tournamentId={selectedTournament._id}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </section>

            {/* Match History */}
            <section className="mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Match History</h2>
                <MatchHistory
                  tournamentId={selectedTournament._id}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
