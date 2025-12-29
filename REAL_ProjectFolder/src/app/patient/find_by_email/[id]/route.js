// app/api/patients/find-by-email/[email]/route.js
import dbConnect from "../../../../lib/mongodb";
import Patient from "../../../../models/patients";
import DoctorSchedule from "../../../../models/DoctorSchedule";

export async function GET(request, { params }) {
  try {
    const { email } = params;
    await dbConnect();
    
    console.log('Searching for patient by email:', email);
    
    // Find patient by email
    const patient = await Patient.findOne({ email: email });
    
    if (!patient) {
      return Response.json({ 
        success: false, 
        message: "Patient not found" 
      }, { status: 404 });
    }
    
    // Get the most recent upcoming appointment
    const now = new Date();
    const upcomingAppointment = await DoctorSchedule.findOne({
      patient_id: patient._id,
      scheduled_date: { $gte: now }
    })
    .sort({ scheduled_date: 1 });
    
    // Update patient's next appointment if found
    if (upcomingAppointment) {
      const appointmentDate = new Date(upcomingAppointment.scheduled_date);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      patient.nextAppointment = formattedDate;
      await patient.save();
    }
    
    return Response.json({
      success: true,
      patient: patient
    });
    
  } catch (error) {
    console.error('Error finding patient by email:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}