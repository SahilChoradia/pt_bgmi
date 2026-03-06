import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import Match from '@/models/Match';
import Tournament from '@/models/Tournament';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admin and editor can reset tournaments
    if (!session || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins and editors can reset tournaments.' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { tournamentId } = body;

    if (!tournamentId) {
      return NextResponse.json(
        { success: false, error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    // Check if user has access to this tournament (admin has access to all)
    if (session.user.role !== 'admin') {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament || !tournament.allowedUsers.map((id: any) => id.toString()).includes(session.user.id)) {
        return NextResponse.json(
          { success: false, error: 'You do not have access to this tournament' },
          { status: 403 }
        );
      }
    }

    // Reset all team stats
    await Team.updateMany(
      { tournamentId },
      {
        $set: {
          matchesPlayed: 0,
          wwcd: 0,
          placementPoints: 0,
          killPoints: 0,
          totalPoints: 0,
        },
      }
    );

    // Delete all matches
    await Match.deleteMany({ tournamentId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
