// app/api/doctors/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Medecin from '../../../../models/Medecin';
import mongoose from 'mongoose';

// GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params; // 👈 FIXED

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }

    const doctor = await Medecin.findById(id).lean();
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: doctor });

  } catch (error: any) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch doctor' },
      { status: 500 }
    );
  }
}

// PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params; // 👈 FIXED

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const updatedDoctor = await Medecin.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedDoctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDoctor,
      message: 'Doctor updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating doctor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update doctor' },
      { status: 500 }
    );
  }
}

// PATCH
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params; // 👈 FIXED

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid doctor ID format' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const updatedDoctor = await Medecin.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedDoctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDoctor,
      message: 'Doctor updated successfully'
    });

  } catch (error: any) {
    console.error('Error patching doctor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update doctor' },
      { status: 500 }
    );
  }
}
