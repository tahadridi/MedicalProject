import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  cin: string;
  email: string;
  password: string;
  role: "client" | "medecin";
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true },
  cin: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "medecin"], default: "client" },
});

// 💡 Important : ne jamais supprimer mongoose.models.User
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
