"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import VerticalStreamerLeaderboard from "@/components/VerticalStreamerLeaderboard";

function StreamContent() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tournamentId) {
      setError("Tournament ID is required");
    }
  }, [tournamentId]);

  if (error || !tournamentId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-2xl">
          {error || "Tournament ID is required. Please access this page with ?tournamentId=xxx"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Left side - Empty space for gameplay capture */}
      <div className="w-full pr-[340px] h-screen bg-black">
        {/* This space is intentionally left empty for OBS gameplay capture overlay */}
      </div>

      {/* Right side - Vertical leaderboard panel */}
      <VerticalStreamerLeaderboard tournamentId={tournamentId} />
    </div>
  );
}

export default function StreamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400 text-2xl">Loading...</div>
      </div>
    }>
      <StreamContent />
    </Suspense>
  );
}

