import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  initials: { type: String, required: true },
  age: { type: Number, required: true },
  status: { type: String, enum: ['stable', 'critical', 'review'], required: true },
  lastSeen: { type: String, required: true },
  tags: [{ type: String }],
  avatar: { type: String },
  risk: { type: String, enum: ['low', 'medium', 'high'], required: true },
  lastBp: { type: String, required: true },
  nextAppointment: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  emergencyContact: { type: String },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date
  }],
  labResults: [{
    test: String,
    value: String,
    status: String,
    date: Date
  }],
  vitalSigns: [{
    name: String,
    value: String,
    status: String,
    date: Date
  }],
labOrders: [
  {
    test_name: { type: String, required: true },
    ordered_by: { type: String, default: "Dr. Non spécifié" },
    order_date: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['ordered', 'in_progress', 'completed', 'cancelled'],
      default: 'ordered'
    },
    // Les autres champs doivent être optionnels si vous les avez définis
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine'
    },
    created_at: { type: Date, default: Date.now }
  }
],
  medicalHistory: [{
    date: Date,
    diagnosis: String,
    treatment: String,
    notes: String
  }]
}, {
  timestamps: true
});

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema);