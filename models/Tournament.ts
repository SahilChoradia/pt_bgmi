import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITournament extends Document {
  tournamentName: string;
  createdAt: Date;
}

const TournamentSchema: Schema = new Schema({
  tournamentName: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Tournament: Model<ITournament> =
  mongoose.models.Tournament || mongoose.model<ITournament>('Tournament', TournamentSchema);

export default Tournament;


