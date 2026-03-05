"use client";

import { motion } from "framer-motion";

interface StreamerRowProps {
  rank: number;
  teamShortName: string;
  placementPoints: number;
  finishPoints: number;
  totalPoints: number;
  isTopThree: boolean;
  logoUrl?: string;
  previousRank?: number;
}

export default function StreamerRow({
  rank,
  teamShortName,
  placementPoints,
  finishPoints,
  totalPoints,
  isTopThree,
  logoUrl,
  previousRank,
}: StreamerRowProps) {
  const getRankColor = () => {
    if (rank === 1) return "border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-900/40 via-yellow-800/20 to-transparent shadow-lg shadow-yellow-900/20";
    if (rank === 2) return "border-l-4 border-gray-400 bg-gradient-to-r from-gray-800/40 via-gray-700/20 to-transparent shadow-lg shadow-gray-800/20";
    if (rank === 3) return "border-l-4 border-orange-600 bg-gradient-to-r from-orange-900/40 via-orange-800/20 to-transparent shadow-lg shadow-orange-900/20";
    return "border-l-4 border-red-700/50 bg-gradient-to-r from-red-900/20 via-red-800/10 to-transparent";
  };

  const getRankTextColor = () => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-orange-400";
    return "text-gray-300";
  };

  const isRankChanged = previousRank && previousRank !== rank;
  const rankDirection = previousRank && previousRank > rank ? "up" : previousRank && previousRank < rank ? "down" : null;

  return (
    <motion.div
      layout
      initial={isRankChanged ? { opacity: 0, y: rankDirection === "up" ? -20 : 20 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className={`${getRankColor()} border border-red-800/30 rounded mb-0.5 px-2 py-1 h-[48px] flex items-center hover:bg-red-900/20 transition-all duration-200`}
    >
      <div className="flex items-center gap-1.5 w-full">
        {/* Rank */}
        <div className={`text-sm font-bold ${getRankTextColor()} w-[40px] flex-shrink-0`}>
          #{rank}
        </div>

        {/* Team Logo */}
        {logoUrl ? (
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
            <img
              src={logoUrl}
              alt={teamShortName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
            {teamShortName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Team Name */}
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">
            {teamShortName}
          </div>
        </div>

        {/* Placement Points */}
        <div className="text-white font-semibold text-sm w-[35px] text-right flex-shrink-0">
          {placementPoints}
        </div>

        {/* Finish Points */}
        <div className="text-white font-semibold text-sm w-[35px] text-right flex-shrink-0">
          {finishPoints}
        </div>

        {/* Total Points */}
        <div className={`text-white font-bold text-sm w-[45px] text-right flex-shrink-0 ${getRankTextColor()}`}>
          {totalPoints}
        </div>
      </div>
    </motion.div>
  );
}

