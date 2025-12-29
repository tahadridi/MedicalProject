import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHealthProfile extends Document {
  userCin: string;      
  userEmail: string;
  height: number;
  weight: number;
  bloodType: string;
  allergies: string;
  allergiesDetails?: string;
  chronic: string;
  chronicDetails?: string;
  smoking: string;
  alcohol: string;
  activity: string;
  gender: string;
  createdAt: Date;
}

const HealthProfileSchema: Schema<IHealthProfile> = new Schema(
  {
    userCin: { type: String, required: true, unique: true }, 
    userEmail: { type: String, required: true },

    height: Number,
    weight: Number,
    bloodType: String,

    allergies: String,
    allergiesDetails: String,

    chronic: String,
    chronicDetails: String,

    smoking: String,
    alcohol: String,
    activity: String,

    gender: String,
  },
  { timestamps: true }
);

const HealthProfile: Model<IHealthProfile> =
  mongoose.models.HealthProfile ||
  mongoose.model<IHealthProfile>("HealthProfile", HealthProfileSchema);

export default HealthProfile;
