import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  roomId: string;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  roomId: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.models.Conversation
 || mongoose.model<IConversation>("Conversation", ConversationSchema);