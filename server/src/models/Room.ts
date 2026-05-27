import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId;
  participants: Types.ObjectId[];
  isPrivate: boolean;
  maxParticipants: number;
  invitedUsers: Types.ObjectId[];
}

const roomSchema = new Schema<IRoom>(
  {
    name:            { type: String, required: true, trim: true, maxlength: 100 },
    description:     { type: String, trim: true, maxlength: 300 },
    owner:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants:    [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isPrivate:       { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 20, min: 2 },
    invitedUsers:    [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

roomSchema.index({ name: 'text' });

export default mongoose.model<IRoom>('Room', roomSchema);
