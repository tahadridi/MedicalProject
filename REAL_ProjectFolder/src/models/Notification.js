// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  type: { 
    type: String, 
    enum: ['appointment_request', 'appointment_confirmation', 'appointment_cancellation', 'prescription_ready', 'lab_result'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);