import mongoose from "mongoose";

const doctorNoteSchema = new mongoose.Schema({
  patient_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Patient' 
  },
  doctor_id: { 
    type: String, 
    required: true,
    default: 'dr_anderson'
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  content: { 
    type: String, 
    required: true 
  },
  type: {
    type: String,
    enum: ['clinical', 'progress', 'treatment', 'assessment', 'general'],
    default: 'clinical'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
doctorNoteSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.models.DoctorNote || mongoose.model("DoctorNote", doctorNoteSchema, "doctor_notes");