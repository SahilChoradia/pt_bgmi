/**
 * Script to create the initial admin user
 * Run with: npx ts-node scripts/seed-admin.ts
 * Or add to package.json scripts and run: npm run seed-admin
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please set MONGODB_URI environment variable');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  whatsappNumber: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    const adminWhatsApp = '+919999999999'; // Default admin WhatsApp number

    // Check if admin already exists
    const existingAdmin = await User.findOne({ whatsappNumber: adminWhatsApp });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      whatsappNumber: adminWhatsApp,
      role: 'admin',
    });

    console.log('Admin user created successfully!');
    console.log('WhatsApp Number:', adminWhatsApp);
    console.log('You can now login with this WhatsApp number!');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
