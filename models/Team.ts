import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeam extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teamName: string;
  shortName?: string;
  playerName?: string;
  logoUrl?: string;
  matchesPlayed: number;
  wwcd: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
}

const TeamSchema: Schema = new Schema({
  tournamentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Tournament',
  },
  teamName: {
    type: String,
    required: true,
    trim: true,
  },
  shortName: {
    type: String,
    required: false,
    default: null,
    trim: true,
  },
  playerName: {
    type: String,
    required: false,
    default: undefined,
    trim: true,
  },
  logoUrl: {
    type: String,
    required: false,
    default: undefined,
    trim: true,
  },
  matchesPlayed: {
    type: Number,
    default: 0,
  },
  wwcd: {
    type: Number,
    default: 0,
  },
  placementPoints: {
    type: Number,
    default: 0,
  },
  killPoints: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
});

// Removed unique index on shortName - no validation needed

// Delete cached model if it exists to ensure fresh schema
if (mongoose.models.Team) {
  delete mongoose.models.Team;
}

const Team: Model<ITeam> = mongoose.model<ITeam>('Team', TeamSchema);

// Drop the old unique index if it exists (run after connection)
const dropOldIndex = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Team.collection.dropIndex('tournamentId_1_shortName_1');
      console.log('Dropped old unique index on shortName');
    }
  } catch (err: any) {
    // Index doesn't exist or already dropped, ignore error
    if (err.code !== 27 && err.codeName !== 'IndexNotFound' && err.message !== 'ns not found') {
      // Silently ignore - index may not exist
    }
  }
};

// Run when connection is ready
if (mongoose.connection.readyState === 1) {
  dropOldIndex();
} else {
  mongoose.connection.once('connected', dropOldIndex);
}

export default Team;

