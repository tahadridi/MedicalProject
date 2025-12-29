// app/api/health-profile/get/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Modèle HealthProfile (utilisez votre modèle existant)
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, cin } = body;
    
    if (!email && !cin) {
      return NextResponse.json(
        { success: false, message: 'Email ou CIN requis' },
        { status: 400 }
      );
    }

    let query = {};
    if (email) {
      query = { userEmail: email };
    } else if (cin) {
      query = { userCin: cin };
    }

    console.log('🔍 Searching HealthProfile with query:', query);
    
    const healthProfile = await HealthProfile.findOne(query);

    if (!healthProfile) {
      console.log('❌ HealthProfile not found with query:', query);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Profil de santé non trouvé',
          email,
          cin
        },
        { status: 404 }
      );
    }

    console.log('✅ HealthProfile found:', healthProfile._id);
    
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