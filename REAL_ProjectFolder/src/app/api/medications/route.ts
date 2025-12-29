// app/api/medications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Medication from '@/models/Medication';

export async function GET(request: NextRequest) {
  await dbConnect();

  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name");
  const limit = searchParams.get("limit") || "10";
  const page = searchParams.get("page") || "1";
  const suggest = searchParams.get("suggest"); // Nouveau paramètre pour les suggestions

  try {
    // Si on demande des suggestions (autocomplétion)
    if (suggest === "true" && name && name.length >= 1) {
      const medications = await Medication.find({
        name: { $regex: `^${name}`, $options: 'i' } // Commence par le texte
      })
      .limit(10)
      .select('name category') // On ne prend que le nom et la catégorie
      .sort({ name: 1 });

      return NextResponse.json({
        success: true,
        suggestions: medications.map(med => ({
          name: med.name,
          category: med.category
        }))
      });
    }

    // Si on recherche par nom (recherche normale)
    if (name) {
      // Recherche exacte d'abord
      let medication = await Medication.findOne({
        name: { $regex: `^${name}$`, $options: 'i' } // Exact match (case insensitive)
      });

      // Si pas trouvé, recherche partielle
      if (!medication) {
        const medications = await Medication.find({
          name: { $regex: name, $options: 'i' } // Recherche partielle
        })
        .limit(1);

        if (medications.length > 0) {
          medication = medications[0];
        }
      }

      if (!medication) {
        return NextResponse.json(
          { error: `Medicines "${name}" non trouvé` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: medication
      });
    }

    // Si pas de nom, retourne la liste paginée
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const medications = await Medication.find({})
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    const total = await Medication.countDocuments({});

    return NextResponse.json({
      success: true,
      data: medications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error: unknown) {
    console.error('Database error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Erreur inconnue lors de la recherche" },
      { status: 500 }
    );
  }
}