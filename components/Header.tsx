"use client";

import { Trophy, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white">BGMI Point Table Maker</h1>
          </div>

          {session && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-gray-300 capitalize">{session.user?.role}</span>
              </div>
              
              <span className="text-gray-400 text-sm">
                {session.user?.name}
              </span>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
