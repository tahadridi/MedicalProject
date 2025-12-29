// app/api/doctors/email/[email]/route.js
import dbConnect from "../../../../../lib/mongodb";
import Medecin from "../../../../../models/Medecin";

export async function GET(request, { params }) {
  try {
    const { email } = params;
    console.log('🩺 Fetching doctor by email:', email);
    
    if (!email) {
      return Response.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }
    
    await dbConnect();
    
    const decodedEmail = decodeURIComponent(email);
    const doctor = await Medecin.findOne({ email: decodedEmail }).lean();
    
    if (!doctor) {
      return Response.json({ 
        success: false, 
        error: 'Doctor not found' 
      }, { status: 404 });
    }
    
    return Response.json({
      success: true,
      data: doctor
    });
    
  } catch (error) {
    console.error('Error fetching doctor by email:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}