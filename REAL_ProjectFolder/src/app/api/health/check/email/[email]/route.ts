import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Votre modèle HealthProfile
const HealthProfileSchema = new mongoose.Schema({
  userCin: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  height: Number,
  weight: Number,
  bloodType: String,
  allergies: String,
  allergiesDetails: String,
  chronic: String,
  chronicDetails: String,
  smoking: String,
  alcohol: String,
  activity: String,
  gender: String,
}, { timestamps: true });

const HealthProfile = mongoose.models.HealthProfile || 
  mongoose.model('HealthProfile', HealthProfileSchema);

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus-clinical');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    await connectDB();
    
    // Décoder l'email (car il peut contenir des caractères spéciaux comme @)
    const email = decodeURIComponent(params.email);
    console.log('🔍 Fetching health profile for email:', email);
    
    const healthProfile = await HealthProfile.findOne({ 
      userEmail: email 
    });

    if (!healthProfile) {
      console.log('❌ Health profile not found for email:', email);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Profil de santé non trouvé',
          email: email
        },
        { status: 404 }
      );
    }

    console.log('✅ Health profile found for:', email);
    
    return NextResponse.json({
      success: true,
      healthProfile: {
        height: healthProfile.height,
        weight: healthProfile.weight,
        bloodType: healthProfile.bloodType,
        allergies: healthProfile.allergies,
        allergiesDetails: healthProfile.allergiesDetails,
        chronic: healthProfile.chronic,
        chronicDetails: healthProfile.chronicDetails,
        smoking: healthProfile.smoking,
        alcohol: healthProfile.alcohol,
        activity: healthProfile.activity,
        gender: healthProfile.gender,
        createdAt: healthProfile.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching health profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}