import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Tournament from '@/models/Tournament';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: tournaments });
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

    // Admin and Editor can create tournaments
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins and editors can create tournaments.' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { tournamentName } = body;

    if (!tournamentName || tournamentName.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Tournament name is required' },
        { status: 400 }
      );
    }

    const tournament = await Tournament.create({
      tournamentName: tournamentName.trim(),
      createdBy: session.user.id,
      allowedUsers: [session.user.id], // Creator is automatically assigned
    });

    return NextResponse.json({ success: true, data: tournament }, { status: 201 });
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

    // Only admin can delete tournaments
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins can delete tournaments.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json(
        { success: false, error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    await Tournament.findByIdAndDelete(tournamentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
