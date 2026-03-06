import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * API route to add users with WhatsApp numbers
 * Access: GET /api/seed-users
 */
export async function GET() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    
    // Drop old email index if it exists
    if (db) {
      try {
        const indexes = await db.collection('users').indexes();
        const emailIndex = indexes.find((idx: any) => idx.name === 'email_1');
        if (emailIndex) {
          await db.collection('users').dropIndex('email_1');
          console.log('Dropped old email index');
        }
      } catch (e) {
        // Index might not exist, that's fine
      }
    }

    // Define schema inline
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      whatsappNumber: { type: String, required: true, unique: true, trim: true },
      role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
      createdAt: { type: Date, default: Date.now },
    });

    // Clear cached model
    if (mongoose.models.User) {
      delete mongoose.models.User;
    }
    
    const User = mongoose.model('User', UserSchema);

    const usersToCreate = [
      { name: 'Admin', whatsappNumber: '+919999999999', role: 'admin' },
      { name: 'Editor', whatsappNumber: '+918888888888', role: 'editor' },
      { name: 'Viewer', whatsappNumber: '+917777777777', role: 'viewer' },
    ];

    const results = [];

    for (const userData of usersToCreate) {
      // Check if user already exists
      const existingUser = await User.findOne({ whatsappNumber: userData.whatsappNumber });
      
      if (existingUser) {
        results.push({ whatsappNumber: userData.whatsappNumber, status: 'already exists' });
      } else {
        // Create new user
        await User.create({
          name: userData.name,
          whatsappNumber: userData.whatsappNumber,
          role: userData.role,
        });
        results.push({ whatsappNumber: userData.whatsappNumber, status: 'created' });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Users ready!',
      results,
      credentials: {
        admin: { whatsappNumber: '+919999999999' },
        editor: { whatsappNumber: '+918888888888' },
        viewer: { whatsappNumber: '+917777777777' },
      },
      note: 'Login with any WhatsApp number - no password needed!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
