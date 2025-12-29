// app/api/doctors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Medecin from '../../../models/Medecin';
import { IMedecin } from '../../../models/Medecin';

// GET: Fetch all doctors
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Optional query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const specialite = searchParams.get('specialite') || '';
    const hopital = searchParams.get('hopital') || '';
    
    // Build filter
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialite: { $regex: search, $options: 'i' } },
        { hopital: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (specialite) {
      filter.specialite = { $regex: specialite, $options: 'i' };
    }
    
    if (hopital) {
      filter.hopital = { $regex: hopital, $options: 'i' };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute queries
    const [doctors, total] = await Promise.all([
      Medecin.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Medecin.countDocuments(filter)
    ]);
    
    return NextResponse.json({
      success: true,
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch doctors' 
      },
      { status: 500 }
    );
  }
}

// PUT: Batch update doctors (optional)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { ids, updateData } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No doctor IDs provided' 
        },
        { status: 400 }
      );
    }
    
    if (!updateData || typeof updateData !== 'object') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No update data provided' 
        },
        { status: 400 }
      );
    }
    
    // Don't allow updating email or CIN in batch update
    delete updateData.email;
    delete updateData.cin;
    
    const result = await Medecin.updateMany(
      { _id: { $in: ids } },
      { $set: updateData },
      { runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `${result.modifiedCount} doctors updated successfully`
    });
    
  } catch (error: any) {
    console.error('Error batch updating doctors:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update doctors' 
      },
      { status: 500 }
    );
  }
}

