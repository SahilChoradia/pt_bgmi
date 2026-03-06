import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API route to seed initial users (admin, editor, viewer)
 * This should only be used once during initial setup
 * Access: GET /api/seed
 */
export async function GET() {
  try {
    await connectDB();

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Users already seeded. This endpoint is disabled.',
      });
    }

    // Create admin user
    await User.create({
      name: 'Admin',
      whatsappNumber: '+919999999999',
      role: 'admin',
    });

    // Create editor user
    await User.create({
      name: 'Editor',
      whatsappNumber: '+918888888888',
      role: 'editor',
    });

    // Create viewer user
    await User.create({
      name: 'Viewer',
      whatsappNumber: '+917777777777',
      role: 'viewer',
    });

    return NextResponse.json({
      success: true,
      message: 'All users created successfully!',
      users: [
        { role: 'Admin', whatsappNumber: '+919999999999' },
        { role: 'Editor', whatsappNumber: '+918888888888' },
        { role: 'Viewer', whatsappNumber: '+917777777777' },
      ],
      note: 'Login with any of these WhatsApp numbers!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
