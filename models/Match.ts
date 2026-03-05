import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatchResult {
  teamId: mongoose.Types.ObjectId;
  placement: number;
  kills: number;
  placementPoints: number;
  totalPoints: number;
}

export interface IMatch extends Document {
  tournamentId: mongoose.Types.ObjectId;
  matchNumber: number;
  results: IMatchResult[];
}

const MatchResultSchema: Schema = new Schema({
  teamId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Team',
  },
  placement: {
    type: Number,
    required: true,
    min: 1,
    max: 16,
  },
  kills: {
    type: Number,
    required: true,
    min: 0,
  },
  placementPoints: {
    type: Number,
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
  },
});

const MatchSchema: Schema = new Schema({
  tournamentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Tournament',
  },
  matchNumber: {
    type: Number,
    required: true,
  },
  results: {
    type: [MatchResultSchema],
    required: true,
  },
});

// Index to ensure matchNumber is unique within a tournament
MatchSchema.index({ tournamentId: 1, matchNumber: 1 }, { unique: true });

const Match: Model<IMatch> =
  mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

export default Match;


