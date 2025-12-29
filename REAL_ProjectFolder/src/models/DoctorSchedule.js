import mongoose from "mongoose";

const doctorScheduleSchema = new mongoose.Schema({
  doctor_id: { type: String, required: true },
  doctor_name: { type: String, required: true  },
  doctor_email: { type: String, required: true },
  doctor_speciality: { type: String, default: 'General Practitioner'},
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  scheduled_date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
 duration_minutes: { type: Number, default: 0 },
  appointment_type: { type: String, enum: ['video', 'in_person', 'phone', 'meeting'], required: true },
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  notes: { type: String },
  recurring_pattern: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
  recurring_end_date: { type: Date },
  created_by: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});
doctorScheduleSchema.pre('save', function(next) {
  if (this.start_time && this.end_time) {
    const [startHour, startMin] = this.start_time.split(':').map(Number);
    const [endHour, endMin] = this.end_time.split(':').map(Number);

    const start = new Date(this.scheduled_date);
    start.setHours(startHour, startMin);

    const end = new Date(this.scheduled_date);
    end.setHours(endHour, endMin);

    const diffMs = end - start;
    this.duration_minutes = Math.max(Math.floor(diffMs / 60000), 0); // in minutes
  }
  next();
});

export default mongoose.models.DoctorSchedule || mongoose.model("DoctorSchedule", doctorScheduleSchema, "Doctor_Schedule");