import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  patient_id: { type: String, required: true, ref: 'Patient' },
  medication_name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema, "Prescriptions");