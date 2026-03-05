import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tournament from '@/models/Tournament';

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
    });

    return NextResponse.json({ success: true, data: tournament }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


