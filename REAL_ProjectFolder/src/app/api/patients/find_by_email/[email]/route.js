// app/api/patients/find-by-email/[email]/route.js
import dbConnect from "../../../../../lib/mongodb";
import Patient from "../../../../../models/patients";

export async function GET(request, { params }) {
  console.log("🟢 API CALLED: /api/patients/[email]");
  
  try {
    // 1. Récupérer l'email des paramètres
    const { email } = params;
    console.log("📧 Param email from URL:", email);
    
    if (!email) {
      console.error("❌ No email provided");
      return Response.json({ 
        success: false, 
        message: "Email is required" 
      }, { status: 400 });
    }
    
    // 2. Décoder l'email (taha%40gmail.com → taha@gmail.com)
    const decodedEmail = decodeURIComponent(email);
    console.log("📧 Decoded email:", decodedEmail);
    
    // 3. Se connecter à MongoDB
    console.log("🔄 Connecting to MongoDB...");
    await dbConnect();
    console.log("✅ Connected to MongoDB");
    
    // 4. Chercher le patient dans la base
    console.log(`🔍 Searching patient with email: "${decodedEmail}"`);
    
    // Méthode 1: Recherche exacte
    const patient = await Patient.findOne({ 
      email: decodedEmail 
    });
    
    // Méthode 2 (alternative): Recherche insensible à la casse
    // const patient = await Patient.findOne({ 
    //   email: { $regex: new RegExp(`^${decodedEmail}$`, 'i') } 
    // });
    
    console.log("🔍 Search result:", patient ? "FOUND" : "NOT FOUND");
    
    if (!patient) {
      console.error(`❌ Patient not found with email: ${decodedEmail}`);
      
      // Vérifier ce qui existe dans la base
      const allPatients = await Patient.find({}, { email: 1, name: 1 }).limit(5);
      console.log("📋 Some patients in DB:", allPatients.map(p => ({ 
        email: p.email, 
        name: p.name 
      })));
      
      return Response.json({ 
        success: false, 
        message: "Patient not found",
        searchedEmail: decodedEmail
      }, { status: 404 });
    }
    
    // 5. Retourner les données
    console.log("✅ Patient found:", {
      id: patient._id,
      name: patient.name,
      email: patient.email,
      age: patient.age
    });
    
    return Response.json({
      success: true,
      patient: patient
    });
    
  } catch (error) {
    console.error("❌ ERROR in API:", error);
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}