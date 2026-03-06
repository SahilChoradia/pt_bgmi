'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Users,
  Shield,
  LogOut,
  ChevronDown,
  Check,
  X,
  Trophy,
  Plus,
  Trash2,
  ArrowLeft,
  Gamepad2,
  UserPlus,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  whatsappNumber: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
}

interface Tournament {
  _id: string;
  tournamentName: string;
  allowedUsers: string[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoleDropdown, setActiveRoleDropdown] = useState<string | null>(null);
  const [activeTournamentDropdown, setActiveTournamentDropdown] = useState<string | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; whatsappNumber: string; role: 'admin' | 'editor' | 'viewer' }>({ name: '', whatsappNumber: '', role: 'viewer' });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated' || session?.user?.role !== 'admin') return;

      try {
        const [usersRes, tournamentsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/tournaments'),
        ]);

        const usersData = await usersRes.json();
        const tournamentsData = await tournamentsRes.json();

        if (usersData.success) setUsers(usersData.data);
        if (tournamentsData.success) setTournaments(tournamentsData.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      const response = await fetch('/api/users/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
    setActiveRoleDropdown(null);
  };

  const handleTournamentAssignment = async (userId: string, tournamentId: string, assign: boolean) => {
    try {
      const response = await fetch('/api/tournaments/assign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tournamentId, assign }),
      });

      const data = await response.json();
      if (data.success) {
        setTournaments(tournaments.map(t => {
          if (t._id === tournamentId) {
            return {
              ...t,
              allowedUsers: assign
                ? [...t.allowedUsers, userId]
                : t.allowedUsers.filter(id => id !== userId),
            };
          }
          return t;
        }));
      }
    } catch (error) {
      console.error('Failed to update tournament assignment:', error);
    }
  };

  // Validate WhatsApp number format
  const isValidWhatsAppNumber = (number: string): boolean => {
    const cleaned = number.replace(/[\s-]/g, '');
    const whatsappRegex = /^\+?[1-9]\d{9,14}$/;
    return whatsappRegex.test(cleaned);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    // Validate WhatsApp number
    if (!isValidWhatsAppNumber(newUser.whatsappNumber)) {
      setCreateError('Please enter a valid WhatsApp number (10-15 digits with optional country code)');
      return;
    }

    setCreateLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          whatsappNumber: newUser.whatsappNumber.replace(/[\s-]/g, ''),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUsers([...users, data.data]);
        setNewUser({ name: '', whatsappNumber: '', role: 'viewer' });
        setShowCreateUser(false);
      } else {
        setCreateError(data.error || 'Failed to create user');
      }
    } catch (error) {
      setCreateError('An unexpected error occurred');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (number: string) => {
    if (!number) return '';
    // If it starts with +, keep it, otherwise just return as is
    if (number.startsWith('+')) {
      return number;
    }
    return number;
  };

  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'editor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-400">Manage users and permissions</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>

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
        {/* Create User Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateUser(!showCreateUser)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create New User
          </button>

          {showCreateUser && (
            <div className="mt-4 bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                {createError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {createError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp Number</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={newUser.whatsappNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d+\s-]/g, '');
                          setNewUser({ ...newUser, whatsappNumber: value });
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'editor' | 'viewer' })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {createLoading ? 'Creating...' : 'Create User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateUser(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              User Management
            </h2>
            <p className="text-gray-400 text-sm mt-1">Manage user roles and tournament access</p>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">WhatsApp Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tournaments</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone className="w-4 h-4 text-green-500" />
                          {formatPhoneNumber(user.whatsappNumber)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setActiveRoleDropdown(activeRoleDropdown === user._id ? null : user._id)}
                            disabled={user._id === session?.user?.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm capitalize ${getRoleBadgeColor(user.role)} ${user._id === session?.user?.id ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
                          >
                            {user.role}
                            {user._id !== session?.user?.id && <ChevronDown className="w-3 h-3" />}
                          </button>

                          {activeRoleDropdown === user._id && (
                            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                              {(['admin', 'editor', 'viewer'] as const).map((role) => (
                                <button
                                  key={role}
                                  onClick={() => handleRoleChange(user._id, role)}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 ${user.role === role ? 'text-amber-400' : 'text-gray-300'}`}
                                >
                                  {user.role === role && <Check className="w-3 h-3" />}
                                  <span className="capitalize">{role}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setActiveTournamentDropdown(activeTournamentDropdown === user._id ? null : user._id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                          >
                            <Trophy className="w-3 h-3" />
                            {tournaments.filter(t => t.allowedUsers?.includes(user._id)).length} assigned
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {activeTournamentDropdown === user._id && (
                            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto">
                              {tournaments.length === 0 ? (
                                <div className="px-4 py-3 text-gray-400 text-sm">No tournaments</div>
                              ) : (
                                tournaments.map((tournament) => {
                                  const isAssigned = tournament.allowedUsers?.includes(user._id);
                                  return (
                                    <button
                                      key={tournament._id}
                                      onClick={() => handleTournamentAssignment(user._id, tournament._id, !isAssigned)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center justify-between gap-2"
                                    >
                                      <span className={isAssigned ? 'text-amber-400' : 'text-gray-300'}>
                                        {tournament.tournamentName}
                                      </span>
                                      {isAssigned ? (
                                        <Check className="w-4 h-4 text-green-400" />
                                      ) : (
                                        <Plus className="w-4 h-4 text-gray-500" />
                                      )}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user._id !== session?.user?.id && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
