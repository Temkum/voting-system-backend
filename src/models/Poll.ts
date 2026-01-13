import mongoose, { Document, Schema } from 'mongoose';

export interface IPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface IPoll extends Document {
  title: string;
  options: IPollOption[];
  createdBy: mongoose.Types.ObjectId;
  totalVotes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pollSchema = new Schema<IPoll>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    options: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true, maxlength: 100 },
        votes: { type: Number, default: 0, min: 0 },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

pollSchema.index({ createdBy: 1, createdAt: -1 });
pollSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model<IPoll>('Poll', pollSchema);
