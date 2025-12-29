// app/api/DoctorSchedule/route.js
import dbConnect from "../../../lib/mongodb";
import DoctorSchedule from "../../../models/DoctorSchedule";
import Patient from "../../../models/patients";

export async function GET() {
  await dbConnect();

  try {
    const schedule = await DoctorSchedule.find().populate("patient_id");
    return Response.json(schedule);
  } catch (error) {
    console.error("Error fetching doctor schedule:", error);
    return Response.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();

  try {
    const data = await request.json();
    
    // Create the appointment
    const item = await DoctorSchedule.create(data);
    await item.populate("patient_id");

    // Update patient's nextAppointment
    const patient = await Patient.findById(data.patient_id);
    if (patient) {
      const appointmentDate = new Date(data.scheduled_date);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      patient.nextAppointment = formattedDate;
      await patient.save();
      
      console.log(`Updated nextAppointment for patient ${patient.name}: ${formattedDate}`);
    }

    return Response.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating doctor schedule:", error);
    return Response.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}