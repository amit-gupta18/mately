import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISession extends Document {
  room: Types.ObjectId;
  startedBy: Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  participants: Types.ObjectId[];
  status: 'active' | 'completed' | 'abandoned';
}

const sessionSchema = new Schema<ISession>(
  {
    room:         { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    startedBy:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startedAt:    { type: Date, required: true },
    endedAt:      { type: Date },
    duration:     { type: Number },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status:       { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  },
  { timestamps: true }
);

sessionSchema.index({ room: 1, createdAt: -1 });
sessionSchema.index({ startedBy: 1, status: 1 });

export default mongoose.model<ISession>('Session', sessionSchema);
