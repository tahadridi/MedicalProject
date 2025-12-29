// app/api/patients/find-by-email/route.js
import dbConnect from "../../../lib/mongodb";
import Patient from "../../../models/patients";

// Handle GET request (with query parameter)
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    console.log('🔍 GET: Recherche patient par email:', email);
    
    return await findPatientByEmail(email);
    
  } catch (error) {
    console.error('GET Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// Handle POST request (with JSON body)
export async function POST(request) {
  try {
    await dbConnect();
    
    const { email } = await request.json();
    
    console.log('🔍 POST: Recherche patient par email:', email);
    
    return await findPatientByEmail(email);
    
  } catch (error) {
    console.error('POST Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// Shared function to find patient
async function findPatientByEmail(email) {
  if (!email) {
    return Response.json({ 
      success: false, 
      message: "Email is required" 
    }, { status: 400 });
  }
  
  const patient = await Patient.findOne({ 
    email: { $regex: new RegExp(`^${email}$`, 'i') } 
  });
  
  if (!patient) {
    return Response.json({ 
      success: false, 
      message: "Patient not found" 
    }, { status: 404 });
  }
  
  return Response.json({
    success: true,
    patient: patient
  });
}