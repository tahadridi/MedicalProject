// app/api/DoctorSchedule/patient/route.js
import dbConnect from "../../../../lib/mongodb";
import DoctorSchedule from "../../../../models/DoctorSchedule";

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    
    if (!patientId) {
      return Response.json({ error: 'Patient ID is required' }, { status: 400 });
    }
    
    console.log('Fetching appointments for patient ID:', patientId);
    
    // Find all appointments for this patient
    const appointments = await DoctorSchedule.find({ 
      patient_id: patientId 
    })
    .sort({ scheduled_date: 1, start_time: 1 });
    
    console.log('Found appointments:', appointments.length);
    
    return Response.json(appointments);
    
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return Response.json([], { status: 200 });
  }
}