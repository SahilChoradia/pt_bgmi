'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Trophy, 
  Users, 
  LogOut, 
  Video, 
  Settings, 
  Calendar,
  Shield,
  Gamepad2,
  Eye,
  Plus,
  UserPlus,
  Target,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface Tournament {
  _id: string;
  tournamentName: string;
  createdAt: string;
  createdBy?: string;
  totalMatches?: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTournaments = async () => {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch('/api/tournaments/accessible');
        const data = await response.json();
        if (data.success) {
          setTournaments(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [status]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'admin';
  const isEditor = session?.user?.role === 'editor';
  const isViewer = session?.user?.role === 'viewer';
  const canEdit = isAdmin || isEditor;

  // Viewer Card Component - Read Only
  const ViewerTournamentCard = ({ tournament }: { tournament: Tournament }) => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg truncate">{tournament.tournamentName}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(tournament.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-gray-700/30 rounded-lg">
        <Target className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-gray-300">
          Matches: <span className="font-semibold text-white">{tournament.totalMatches || 0}</span>
        </span>
      </div>

      <Link
        href={`/leaderboard?tournamentId=${tournament._id}`}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-amber-600/20"
      >
        <Eye className="w-4 h-4" />
        View Points Table
      </Link>
    </div>
  );

  // Editor Card Component - Limited Edit Access
  const EditorTournamentCard = ({ tournament }: { tournament: Tournament }) => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg truncate">{tournament.tournamentName}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(tournament.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-gray-700/30 rounded-lg">
        <Target className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-gray-300">
          Matches: <span className="font-semibold text-white">{tournament.totalMatches || 0}</span>
        </span>
      </div>

      <div className="space-y-2">
        <Link
          href={`/?tournamentId=${tournament._id}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl transition-all duration-200"
        >
          <Settings className="w-4 h-4" />
          Manage Tournament
        </Link>
        
        <Link
          href={`/?tournamentId=${tournament._id}&action=teams`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 border border-gray-600/50"
        >
          <UserPlus className="w-4 h-4" />
          Add Teams
        </Link>
        
        <Link
          href={`/?tournamentId=${tournament._id}&action=match`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 border border-gray-600/50"
        >
          <Target className="w-4 h-4" />
          Add Match Points
        </Link>
        
        <Link
          href={`/leaderboard?tournamentId=${tournament._id}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 border border-gray-600/50"
        >
          <BarChart3 className="w-4 h-4" />
          View Leaderboard
        </Link>
        
        <Link
          href={`/stream?tournamentId=${tournament._id}`}
          target="_blank"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all duration-200"
        >
          <Video className="w-4 h-4" />
          Streamer View
        </Link>
      </div>
    </div>
  );

  // Admin Card Component - Full Access (uses the existing logic)
  const AdminTournamentCard = ({ tournament }: { tournament: Tournament }) => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg truncate">{tournament.tournamentName}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(tournament.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-gray-700/30 rounded-lg">
        <Target className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-gray-300">
          Matches: <span className="font-semibold text-white">{tournament.totalMatches || 0}</span>
        </span>
      </div>

      <div className="space-y-2">
        <Link
          href={`/?tournamentId=${tournament._id}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all duration-200"
        >
          <Settings className="w-4 h-4" />
          Manage Tournament
        </Link>
        
        <Link
          href={`/stream?tournamentId=${tournament._id}`}
          target="_blank"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all duration-200"
        >
          <Video className="w-4 h-4" />
          Streamer View
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {session?.user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-gray-300 capitalize">{session?.user?.role}</span>
              </div>
              
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  Manage Tournaments
                </Link>
              )}
              
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tournaments</p>
                <p className="text-2xl font-bold text-white">{tournaments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Your Role</p>
                <p className="text-2xl font-bold text-white capitalize">{session?.user?.role}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Access Level</p>
                <p className="text-2xl font-bold text-white">
                  {isAdmin ? 'Full' : isEditor ? 'Edit' : 'View'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Editor - Create Tournament Button */}
        {isEditor && (
          <div className="mb-8">
            <Link
              href="/?action=create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-5 h-5" />
              Create Tournament
            </Link>
          </div>
        )}

        {/* Tournaments Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {isViewer ? 'All Tournaments' : isEditor ? 'Your Tournaments' : 'All Tournaments'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isViewer 
              ? 'Browse tournaments and view their leaderboards'
              : isEditor 
                ? 'Manage your assigned tournaments' 
                : 'Full access to all tournaments (Admin)'
            }
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No tournaments available</p>
            <p className="text-gray-500 text-sm mt-2">
              {isAdmin 
                ? 'Create a new tournament to get started' 
                : isEditor 
                  ? 'Contact an admin to get access to tournaments'
                  : 'No tournaments have been created yet'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              isViewer ? (
                <ViewerTournamentCard key={tournament._id} tournament={tournament} />
              ) : isEditor ? (
                <EditorTournamentCard key={tournament._id} tournament={tournament} />
              ) : (
                <AdminTournamentCard key={tournament._id} tournament={tournament} />
              )
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
