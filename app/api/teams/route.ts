import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import Tournament from '@/models/Tournament';
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

    const teams = await Team.find({ tournamentId }).sort({ totalPoints: -1, killPoints: -1, placementPoints: -1 });
    return NextResponse.json({ success: true, data: teams });
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

    // Only admin and editor can add teams
    if (!session || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins and editors can add teams.' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { tournamentId, teamName, shortName, playerName, logoUrl } = body;

    if (!tournamentId || !teamName || !teamName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tournament ID and Team Name are required' },
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

    const finalShortName = shortName?.trim() || null;
    const finalPlayerName = playerName?.trim() || null;
    const finalLogoUrl = logoUrl?.trim() || null;

    // Build team object, only including fields that have values
    const teamData: any = {
      tournamentId,
      teamName: teamName.trim(),
    };

    // Only add shortName if it has a value
    if (finalShortName) {
      teamData.shortName = finalShortName;
    }

    // Only add optional fields if they have values
    if (finalPlayerName) {
      teamData.playerName = finalPlayerName;
    }
    if (finalLogoUrl) {
      teamData.logoUrl = finalLogoUrl;
    }

    const team = await Team.create(teamData);

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admin and editor can edit teams
    if (!session || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins and editors can edit teams.' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { teamId, teamName, shortName, playerName, logoUrl } = body;

    if (!teamId || !teamName || !teamName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Team ID and Team Name are required' },
        { status: 400 }
      );
    }

    // Get the team to check tournament access
    const existingTeam = await Team.findById(teamId);
    if (!existingTeam) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this tournament (admin has access to all)
    if (session.user.role !== 'admin') {
      const tournament = await Tournament.findById(existingTeam.tournamentId);
      if (!tournament || !tournament.allowedUsers.map((id: any) => id.toString()).includes(session.user.id)) {
        return NextResponse.json(
          { success: false, error: 'You do not have access to this tournament' },
          { status: 403 }
        );
      }
    }

    const finalShortName = shortName?.trim() || null;
    const finalPlayerName = playerName?.trim() || null;
    const finalLogoUrl = logoUrl?.trim() || null;

    // Build update object
    const updateData: any = {
      teamName: teamName.trim(),
    };

    // Only add shortName if it has a value, otherwise set to null
    updateData.shortName = finalShortName || null;
    updateData.playerName = finalPlayerName;
    updateData.logoUrl = finalLogoUrl;

    const team = await Team.findByIdAndUpdate(
      teamId,
      updateData,
      { new: true }
    );

    return NextResponse.json({ success: true, data: team });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admin and editor can delete teams
    if (!session || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins and editors can delete teams.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the team to check tournament access
    const existingTeam = await Team.findById(teamId);
    if (!existingTeam) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this tournament (admin has access to all)
    if (session.user.role !== 'admin') {
      const tournament = await Tournament.findById(existingTeam.tournamentId);
      if (!tournament || !tournament.allowedUsers.map((id: any) => id.toString()).includes(session.user.id)) {
        return NextResponse.json(
          { success: false, error: 'You do not have access to this tournament' },
          { status: 403 }
        );
      }
    }

    await Team.findByIdAndDelete(teamId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
