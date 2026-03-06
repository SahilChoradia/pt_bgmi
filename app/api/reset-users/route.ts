import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * API route to reset the users collection
 * This drops the old collection and indexes, allowing fresh user creation
 * Access: GET /api/reset-users
 * WARNING: This deletes ALL users!
 */
export async function GET() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    
    // Check if collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length > 0) {
      // Drop all indexes first (this removes the old email_1 index)
      try {
        await db.collection('users').dropIndexes();
        console.log('Dropped all indexes on users collection');
      } catch (e: any) {
        console.log('Index drop note:', e.message);
      }

      // Drop the entire collection
      try {
        await db.dropCollection('users');
        console.log('Dropped users collection');
      } catch (e: any) {
        console.log('Collection drop note:', e.message);
      }
    }

    // Clear cached model
    if (mongoose.models.User) {
      delete mongoose.models.User;
    }

    return NextResponse.json({
      success: true,
      message: 'Users collection and old indexes have been reset!',
      nextStep: 'Now visit /api/seed-users to create default users, or just login with any WhatsApp number.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
