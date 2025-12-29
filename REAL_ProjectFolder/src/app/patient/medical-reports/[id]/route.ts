import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Patient from "@/models/patients";
import HealthProfile from "@/models/HealthProfile";

export async function GET(req, { params }) {
  await dbConnect();

  const { patientId } = params;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return NextResponse.json(
      { success: false, message: "Patient not found" },
      { status: 404 }
    );
  }

  const healthProfile = await HealthProfile.findOne({ patient: patientId });

  return NextResponse.json({
    success: true,
    patient,
    healthProfile
  });
}
