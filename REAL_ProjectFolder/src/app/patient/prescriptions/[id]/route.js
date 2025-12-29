// app/api/prescriptions/patient/[patientId]/route.js
import dbConnect from "../../../../../lib/mongodb";
import Prescription from "../../../../models/Prescription";

export async function GET(request, { params }) {
  try {
    const { patientId } = await params;
    await dbConnect();
    
    console.log('Fetching prescriptions for patient:', patientId);
    
    // Find prescriptions for this patient
    const prescriptions = await Prescription.find({ 
      patient_id: patientId 
    })
    .sort({ created_at: -1 });
    
    console.log('Found prescriptions:', prescriptions.length);
    
    // Transform to match your frontend interface
    const transformedPrescriptions = prescriptions.map(pres => ({
      _id: pres._id.toString(),
      medication_name: pres.medication_name,
      dosage: pres.dosage,
      frequency: pres.frequency,
      start_date: new Date(pres.created_at).toISOString().split('T')[0],
      end_date: calculateEndDate(pres.created_at, pres.duration).toISOString().split('T')[0],
      status: 'active',
      doctor_name: 'Dr. Anderson',
      instructions: pres.instructions || ''
    }));
    
    return Response.json(transformedPrescriptions);
    
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return Response.json([]);
  }
}

function calculateEndDate(startDate, duration) {
  const date = new Date(startDate);
  const durationStr = (duration || '').toLowerCase();
  
  if (durationStr.includes('day') || durationStr.includes('jour')) {
    const days = parseInt(durationStr) || 7;
    date.setDate(date.getDate() + days);
  } else if (durationStr.includes('week') || durationStr.includes('semaine')) {
    const weeks = parseInt(durationStr) || 1;
    date.setDate(date.getDate() + (weeks * 7));
  } else if (durationStr.includes('month') || durationStr.includes('mois')) {
    const months = parseInt(durationStr) || 1;
    date.setMonth(date.getMonth() + months);
  } else if (durationStr.includes('year') || durationStr.includes('an')) {
    const years = parseInt(durationStr) || 1;
    date.setFullYear(date.getFullYear() + years);
  } else {
    date.setDate(date.getDate() + 30); // Default 30 days
  }
  
  return date;
}