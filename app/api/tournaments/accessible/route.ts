import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import Match from '@/models/Match';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    let tournaments;

    if (session.user.role === 'admin' || session.user.role === 'viewer') {
      // Admin and Viewer can see all tournaments
      tournaments = await Tournament.find().sort({ createdAt: -1 });
    } else {
      // Editors can only see tournaments they are assigned to
      tournaments = await Tournament.find({
        allowedUsers: session.user.id,
      }).sort({ createdAt: -1 });
    }

    // Fetch match counts for each tournament
    const tournamentsWithMatchCount = await Promise.all(
      tournaments.map(async (tournament) => {
        const matchCount = await Match.countDocuments({ tournamentId: tournament._id });
        return {
          _id: tournament._id,
          tournamentName: tournament.tournamentName,
          createdAt: tournament.createdAt,
          createdBy: tournament.createdBy,
          totalMatches: matchCount,
        };
      })
    );

    return NextResponse.json({ success: true, data: tournamentsWithMatchCount });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

