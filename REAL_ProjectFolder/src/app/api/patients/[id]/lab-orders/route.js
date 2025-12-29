// app/api/patients/[id]/lab-orders/route.js
import dbConnect from "../../../../../lib/mongodb";
import Patient from "../../../../../models/patients";

export async function POST(request, { params }) {
  console.log("🔵 === API: POST /api/patients/[id]/lab-orders ===");
  
  try {
    const { id } = params;
    console.log("👤 Patient ID from params:", id);
    
    const body = await request.json();
    console.log("📋 Request body received:", JSON.stringify(body, null, 2));
    
    // Vérifier les deux formats possibles
    let labOrdersToAdd = [];
    
    if (Array.isArray(body.lab_orders)) {
      // Format: { lab_orders: [...] }
      console.log("📦 Format: lab_orders array");
      labOrdersToAdd = body.lab_orders;
    } else if (body.test_name) {
      // Format: { test_name: "...", ... }
      console.log("📦 Format: single lab order");
      labOrdersToAdd = [body];
    } else {
      return Response.json({ 
        success: false, 
        message: "Invalid request format. Send either { test_name, ... } or { lab_orders: [...] }",
        received: body
      }, { status: 400 });
    }
    
    console.log(`📊 Number of lab orders to add: ${labOrdersToAdd.length}`);
    
    await dbConnect();
    console.log("✅ Connected to MongoDB");
    
    // Trouver le patient
    const patient = await Patient.findById(id);
    
    if (!patient) {
      console.log("❌ Patient not found with ID:", id);
      return Response.json({ 
        success: false, 
        message: "Patient non trouvé" 
      }, { status: 404 });
    }
    
    console.log("✅ Patient trouvé:", patient.name);
    
    // Initialiser labOrders si nécessaire
    if (!patient.labOrders) {
      patient.labOrders = [];
      console.log("📋 Initialized empty labOrders array");
    }
    
    // Ajouter chaque commande
    const addedOrders = [];
    
    for (const orderData of labOrdersToAdd) {
      const newLabOrder = {
        test_name: orderData.test_name,
        ordered_by: orderData.ordered_by || "Dr. Non spécifié",
        order_date: orderData.order_date ? new Date(orderData.order_date) : new Date(),
        status: orderData.status || 'ordered',
        priority: orderData.priority || 'routine',
        instructions: orderData.instructions || '',
        lab_location: orderData.lab_location || 'Laboratoire principal',
        appointment_date: orderData.appointment_date ? new Date(orderData.appointment_date) : null,
        notes: orderData.notes || '',
        created_at: new Date()
      };
      
      console.log(`➕ Adding lab order: ${newLabOrder.test_name}`);
      patient.labOrders.push(newLabOrder);
      addedOrders.push(newLabOrder);
    }
    
    // Sauvegarder les modifications
    await patient.save();
    
    console.log("✅ Lab orders ajoutées avec succès");
    console.log("📊 Total lab orders now:", patient.labOrders.length);
    
    return Response.json({
      success: true,
      message: `${labOrdersToAdd.length} commande(s) de laboratoire ajoutée(s) avec succès`,
      addedOrders: addedOrders,
      totalOrders: patient.labOrders.length,
      patient: {
        name: patient.name,
        _id: patient._id
      }
    });
    
  } catch (error) {
    console.error("❌ ERREUR DANS L'API lab-orders:", error);
    console.error("Stack trace:", error.stack);
    
    return Response.json({ 
      success: false, 
      error: error.message,
      message: "Erreur lors de l'ajout de la commande"
    }, { status: 500 });
  }
}