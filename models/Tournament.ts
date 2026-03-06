import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITournament extends Document {
  tournamentName: string;
  createdBy: mongoose.Types.ObjectId;
  allowedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const TournamentSchema: Schema = new Schema({
  tournamentName: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for backward compatibility with existing tournaments
  },
  allowedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Tournament: Model<ITournament> =
  mongoose.models.Tournament || mongoose.model<ITournament>('Tournament', TournamentSchema);

export default Tournament;
