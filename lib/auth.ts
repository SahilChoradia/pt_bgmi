import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { UserRole } from '@/models/User';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      whatsappNumber: string;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    name: string;
    whatsappNumber: string;
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    whatsappNumber: string;
    role: UserRole;
  }
}

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

// Get or create User model with proper schema
async function getUserModel() {
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

  // Define schema inline to ensure it's fresh
  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
    createdAt: { type: Date, default: Date.now },
  });

  // Clear cached model and create fresh one
  if (mongoose.models.User) {
    delete mongoose.models.User;
  }
  
  return mongoose.model('User', UserSchema);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'WhatsApp',
      credentials: {
        whatsappNumber: { label: 'WhatsApp Number', type: 'tel' },
      },
      async authorize(credentials) {
        if (!credentials?.whatsappNumber) {
          throw new Error('WhatsApp number is required');
        }

        const normalizedNumber = normalizeWhatsAppNumber(credentials.whatsappNumber);

        if (!isValidWhatsAppNumber(normalizedNumber)) {
          throw new Error('Please enter a valid WhatsApp number (10-15 digits)');
        }

        const User = await getUserModel();

        // Find user by WhatsApp number
        let user = await User.findOne({ whatsappNumber: normalizedNumber });

        // If user doesn't exist, create a new viewer account
        if (!user) {
          user = await User.create({
            name: `User ${normalizedNumber.slice(-4)}`,
            whatsappNumber: normalizedNumber,
            role: 'viewer',
          });
        }

        return {
          id: user._id.toString(),
          name: user.name,
          whatsappNumber: user.whatsappNumber,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.whatsappNumber = user.whatsappNumber;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.whatsappNumber = token.whatsappNumber;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
