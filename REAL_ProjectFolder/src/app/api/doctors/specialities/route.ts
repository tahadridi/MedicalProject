// app/api/doctors/specialties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../..//lib/mongodb';
import Medecin from '../../../../models/Medecin';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get unique specialties
    const specialties = await Medecin.distinct('specialite');
    
    // Clean and sort specialties
    const cleanedSpecialties = specialties
      .filter(s => s && s.trim().length > 0)
      .map(s => s.trim())
      .sort();
    
    return NextResponse.json({
      success: true,
      data: cleanedSpecialties
    });
    
  } catch (error: any) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}

