// models/Medication.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedication extends Document {
  name: string;
  dosage?: string;
  description?: string;
  sideEffects: string[];
  usage?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Le nom du médicament est requis'], 
    unique: true,
    trim: true 
  },
  dosage: { 
    type: String, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  sideEffects: [{ 
    type: String, 
    trim: true 
  }],
  usage: { 
    type: String, 
    trim: true 
  },
  category: { 
    type: String, 
    trim: true 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create or retrieve model
const Medication: Model<IMedication> = mongoose.models.Medication || 
  mongoose.model<IMedication>('Medication', MedicationSchema);

export default Medication;