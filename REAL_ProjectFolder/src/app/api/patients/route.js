// app/api/patients/route.js
import dbConnect from "../../../lib/mongodb";
import Patient from "../../../models/patients";

export async function GET() {
  try {
    await dbConnect();
    console.log('🔄 API Route: Fetching patients from database...');
    const patients = await Patient.find().sort({ id: 1 });
    console.log(`✅ API Route: Found ${patients.length} patients`);
    return Response.json(patients);
  } catch (error) {
    console.error('❌ API Route Error:', error);
    return Response.json({ error: "Failed to fetch patients: " + error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    console.log('🔄 API Route: Creating patient with data:', data);

    // Generate a unique ID if not provided
    if (!data.id) {
      const lastPatient = await Patient.findOne().sort({ id: -1 });
      data.id = lastPatient ? lastPatient.id + 1 : 1;
    }

    const newPatient = await Patient.create(data);
    console.log('✅ API Route: Patient created successfully:', newPatient._id);
    return Response.json(newPatient, { status: 201 });
  } catch (error) {
    console.error('❌ API Route Error:', error);
    return Response.json({ error: "Failed to create patient: " + error.message }, { status: 500 });
  }
}