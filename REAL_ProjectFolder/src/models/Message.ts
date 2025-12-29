/// models/Message.ts (version mise à jour)
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  roomId: string;
  content: string;
  fileUrl?: string; // URL du fichier
  fileName?: string; // Nom original du fichier
  fileType?: string; // Type MIME du fichier
  fileSize?: number; // Taille en bytes
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: String, required: true },
    content: { type: String, default: "" },
    fileUrl: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    fileSize: { type: Number }
  },
  { timestamps: true }
);

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;