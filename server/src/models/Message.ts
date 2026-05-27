import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  room: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    room:   { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text:   { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

messageSchema.index({ room: 1, createdAt: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);
