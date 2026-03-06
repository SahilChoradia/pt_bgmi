import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

// Validate WhatsApp number format
function isValidWhatsAppNumber(number: string): boolean {
  const cleaned = number.replace(/[\s-]/g, '');
  const whatsappRegex = /^\+?[1-9]\d{9,14}$/;
  return whatsappRegex.test(cleaned);
}

// Normalize WhatsApp number
function normalizeWhatsAppNumber(number: string): string {
  return number.replace(/[\s-]/g, '').trim();
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
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

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { name, whatsappNumber, role } = body;

    if (!name || !whatsappNumber) {
      return NextResponse.json(
        { success: false, error: 'Name and WhatsApp number are required' },
        { status: 400 }
      );
    }

    const normalizedNumber = normalizeWhatsAppNumber(whatsappNumber);

    // Validate WhatsApp number format
    if (!isValidWhatsAppNumber(normalizedNumber)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid WhatsApp number (10-15 digits)' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ whatsappNumber: normalizedNumber });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this WhatsApp number already exists' },
        { status: 400 }
      );
    }

    const user = await User.create({
      name: name.trim(),
      whatsappNumber: normalizedNumber,
      role: role || 'viewer',
    });

    // Return user data
    const userResponse = {
      _id: user._id,
      name: user.name,
      whatsappNumber: user.whatsappNumber,
      role: user.role,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
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

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await connectDB();
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
