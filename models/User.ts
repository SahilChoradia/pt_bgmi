import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  whatsappNumber: string;
  role: UserRole;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  whatsappNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Delete the cached model to ensure the new schema is used
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
