import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  userId: mongoose.Types.ObjectId;
  pollId: mongoose.Types.ObjectId;
  optionId: string;
  createdAt: Date;
}

const voteSchema = new Schema<IVote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pollId: {
      type: Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
    },
    optionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

voteSchema.index({ userId: 1, pollId: 1 }, { unique: true });
voteSchema.index({ pollId: 1 });

export default mongoose.model<IVote>('Vote', voteSchema);
