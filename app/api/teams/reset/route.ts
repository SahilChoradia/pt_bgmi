import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import Match from '@/models/Match';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { tournamentId } = body;

    if (!tournamentId) {
      return NextResponse.json(
        { success: false, error: 'Tournament ID is required' },
        { status: 400 }
      );
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


