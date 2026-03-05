import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import Match from '@/models/Match';
import Tournament from '@/models/Tournament';
import { sortTeamsForLeaderboard } from '@/utils/sorting';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json(
        { success: false, error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    // Get tournament info
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Get teams
    const teams = await Team.find({ tournamentId });
    const sortedTeams = sortTeamsForLeaderboard(teams);

    // Get total matches
    const matches = await Match.find({ tournamentId });
    const totalMatches = matches.length;

    return NextResponse.json({
      success: true,
      data: {
        tournament: {
          _id: tournament._id,
          tournamentName: tournament.tournamentName,
        },
        teams: sortedTeams,
        totalMatches,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


