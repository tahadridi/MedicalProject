// models/Medecin.ts (updated)
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedecin extends Document {
  nom: string;
  prenom: string;
  password: string; 
  email: string;
  specialite: string;
  cin: number;
  telephone?: string;
  num_licence?: string;
  hopital?: string;
  departement?: string;
  bio?: string;
  adresse?: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };
  annees_experience?: number;
  created_at?: Date;
}

const MedecinSchema: Schema<IMedecin> = new Schema({
  nom: { type: String, required: true }, 
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
  specialite: { type: String, required: true },
  cin: { type: Number, required: true }, 
  telephone: { type: String },
  num_licence: { type: String },
  hopital: { type: String },
  departement: { type: String },
  bio: { type: String },
  adresse: {
    rue: { type: String },
    ville: { type: String },
    code_postal: { type: String },
    pays: { type: String }
  },
  annees_experience: { type: Number },
  created_at: { type: Date, default: Date.now }
});

// Prevent model overwrite error
export const Medecin: Model<IMedecin> = 
  mongoose.models.Medecin || mongoose.model<IMedecin>("Medecin", MedecinSchema);

export default Medecin;