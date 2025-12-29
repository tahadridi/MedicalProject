// app/api/medications/suggest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Medication from '@/models/Medication';

export async function GET(request: NextRequest) {
  await dbConnect();

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json({
      success: true,
      suggestions: []
    });
  }

  try {
    const medications = await Medication.find({
      name: { $regex: `^${query}`, $options: 'i' }
    })
    .limit(10)
    .select('name category dosage')
    .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      suggestions: medications.map(med => ({
        name: med.name,
        category: med.category,
        dosage: med.dosage,
        id: med._id
      }))
    });

  } catch (error: unknown) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: true,
      suggestions: []
    });
  }
}