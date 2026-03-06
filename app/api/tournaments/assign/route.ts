import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { userId, tournamentId, assign } = body;

    if (!userId || !tournamentId || typeof assign !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'User ID, tournament ID, and assign flag are required' },
        { status: 400 }
      );
    }

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (assign) {
      // Add user to allowedUsers if not already present
      if (!tournament.allowedUsers.includes(userId)) {
        tournament.allowedUsers.push(userId);
      }
    } else {
      // Remove user from allowedUsers
      tournament.allowedUsers = tournament.allowedUsers.filter(
        (id: any) => id.toString() !== userId
      );
    }

    await tournament.save();

    return NextResponse.json({ success: true, data: tournament });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

