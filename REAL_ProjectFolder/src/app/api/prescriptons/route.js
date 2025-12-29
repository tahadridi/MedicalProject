// app/api/prescriptons/route.js
import dbConnect from "../../../lib/mongodb";
import Prescription from "../../../models/Prescription";
import Patient from "../../../models/patients";

export async function GET() {
  try {
    await dbConnect();
    const prescriptions = await Prescription.find();
    return Response.json(prescriptions);
  } catch {
    return Response.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
  }
}

// Just update your existing app/api/prescriptons/route.js POST function:
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    console.log('💊 Creating prescription:', data);
    
    // 1. Save the prescription
    const prescription = await Prescription.create(data);
    
    // 2. Update the patient's medications array (optional bonus)
    try {
      const patient = await Patient.findById(data.patient_id);
      if (patient) {
        // Add to medications array
        const newMedication = {
          name: data.medication_name,
          dosage: data.dosage,
          frequency: data.frequency,
          startDate: new Date()
        };
        
        if (!patient.medications) patient.medications = [];
        patient.medications.push(newMedication);
        patient.markModified('medications');
        await patient.save();
        
        console.log(`✅ Also added to patient ${patient.name}'s medications array`);
      }
    } catch (patientError) {
      console.log('⚠️ Could not update patient medications (not critical):', patientError);
      // Continue anyway - the prescription is already saved
    }
    
    return Response.json(prescription, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating prescription:', error);
    return Response.json({ error: "Failed to create prescription" }, { status: 500 });
  }
}