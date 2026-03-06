'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { 
  Trophy, 
  ArrowLeft, 
  Calendar,
  Target,
  Users,
  Gamepad2,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { sortTeamsForLeaderboard } from '@/utils/sorting';

interface Team {
  _id: string;
  teamName: string;
  shortName?: string;
  playerName?: string;
  matchesPlayed: number;
  wwcd: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
}

interface Tournament {
  _id: string;
  tournamentName: string;
}

interface LeaderboardData {
  tournament: Tournament;
  teams: Team[];
  totalMatches: number;
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const tournamentId = searchParams.get('tournamentId');
  
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = session?.user?.role === 'admin';
  const isEditor = session?.user?.role === 'editor';
  const isViewer = session?.user?.role === 'viewer';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!tournamentId || status !== 'authenticated') return;

      try {
        const response = await fetch(`/api/leaderboard?tournamentId=${tournamentId}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to load leaderboard');
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tournamentId, status]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournamentId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-red-400 text-xl mb-4">Tournament ID is required</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-l-4 border-yellow-500';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-l-4 border-gray-400';
    if (rank === 3) return 'bg-gradient-to-r from-orange-600/20 to-amber-600/20 border-l-4 border-orange-600';
    return 'bg-gray-800/30 hover:bg-gray-800/50';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Leaderboard</h1>
                  <p className="text-sm text-gray-400">
                    {data?.tournament?.tournamentName || 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-300 capitalize">{session?.user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-red-400 text-xl mb-4">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        ) : data ? (
          <>
            {/* Tournament Info */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6 mb-8">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{data.tournament.tournamentName}</h2>
                    <p className="text-gray-400 text-sm">Points Table</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 ml-auto">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      Teams: <span className="font-semibold text-white">{data.teams.length}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">
                      Matches: <span className="font-semibold text-white">{data.totalMatches}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Viewer Notice */}
            {isViewer && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                <p className="text-amber-400 text-sm text-center">
                  👁️ You are viewing this leaderboard in <strong>read-only mode</strong>
                </p>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900/80 border-b border-gray-700">
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 w-16">Rank</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 w-24">Short</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Team Name</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300 w-24">Matches</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300 w-20">WWCD</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300 w-28">Place Pts</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300 w-24">Kill Pts</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300 w-28">Total Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.teams.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                          No teams registered yet
                        </td>
                      </tr>
                    ) : (
                      data.teams.map((team, index) => {
                        const rank = index + 1;
                        return (
                          <tr
                            key={team._id}
                            className={`border-b border-gray-700/50 transition-colors ${getRankStyle(rank)}`}
                          >
                            <td className="px-4 py-4">
                              <span className="text-xl font-bold">{getRankIcon(rank)}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-semibold text-amber-400">
                                {team.shortName || team.teamName.substring(0, 3).toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-white">{team.teamName}</div>
                                {team.playerName && (
                                  <div className="text-xs text-gray-400">{team.playerName}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center text-gray-300">{team.matchesPlayed}</td>
                            <td className="px-4 py-4 text-center">
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded font-semibold">
                                {team.wwcd}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center text-gray-300">{team.placementPoints}</td>
                            <td className="px-4 py-4 text-center text-gray-300">{team.killPoints}</td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-lg font-bold text-amber-400">{team.totalPoints}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    }>
      <LeaderboardContent />
    </Suspense>
  );
}

