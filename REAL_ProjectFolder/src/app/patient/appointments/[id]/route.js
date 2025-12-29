// app/api/appointments/patient/[patientId]/route.js
import dbConnect from "../../../../lib/mongodb";
import DoctorSchedule from "../../../../models/DoctorSchedule";

export async function GET(request, { params }) {
  try {
    const { patientId } = await params;
    await dbConnect();
    
    console.log('Fetching appointments for patient ID:', patientId);
    
    // Find all appointments for this patient
    const appointments = await DoctorSchedule.find({ 
      patient_id: patientId 
    })
    .sort({ scheduled_date: 1 });
    
    console.log('Found appointments:', appointments.length);
    
    return Response.json(appointments);
    
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return Response.json([], { status: 200 }); // Return empty array instead of error
  }
}