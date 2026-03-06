import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';
import Team from '@/models/Team';
import Tournament from '@/models/Tournament';
import { calculatePlacementPoints, calculateTotalPoints } from '@/utils/points';
import { authOptions } from '@/lib/auth';

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

    const matches = await Match.find({ tournamentId })
      .populate('results.teamId', 'teamName shortName')
      .sort({ matchNumber: -1 });

    return NextResponse.json({ success: true, data: matches });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admin and editor can add match results
    if (!session || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins and editors can add match results.' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { tournamentId, matchNumber, results } = body;

    if (!tournamentId || !matchNumber || !results || !Array.isArray(results)) {
      return NextResponse.json(
        { success: false, error: 'Tournament ID, match number, and results are required' },
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

    // Calculate points for each result
    const matchResults = results.map((result: any) => {
      const placementPoints = calculatePlacementPoints(result.placement);
      const totalPoints = calculateTotalPoints(result.placement, result.kills);

      return {
        teamId: result.teamId,
        placement: result.placement,
        kills: result.kills,
        placementPoints,
        totalPoints,
      };
    });

    // Create match
    const match = await Match.create({
      tournamentId,
      matchNumber,
      results: matchResults,
    });

    // Update team stats
    for (const result of matchResults) {
      const team = await Team.findById(result.teamId);
      if (team) {
        team.matchesPlayed += 1;
        if (result.placement === 1) {
          team.wwcd += 1;
        }
        team.placementPoints += result.placementPoints;
        team.killPoints += result.kills;
        team.totalPoints += result.totalPoints;
        await team.save();
      }
    }

    const populatedMatch = await Match.findById(match._id)
      .populate('results.teamId', 'teamName shortName');

    return NextResponse.json({ success: true, data: populatedMatch }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Match number already exists in this tournament' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
