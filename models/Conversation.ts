import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'ai';
  content: string;
  createdAt: Date;
}

export interface IConversation extends Document {
  user: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    messages: [ChatMessageSchema],
  },
  {
    timestamps: true,
  }
);

const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;


