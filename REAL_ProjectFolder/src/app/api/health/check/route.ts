// app/api/health/check/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HealthProfile from "@/models/HealthProfile";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { cin,email } = await req.json();

    // Check if health profile exists for this CIN
    const existingProfile = await HealthProfile.findOne({ userCin: cin, userEmail: email });
    
    return NextResponse.json({ 
      hasProfile: !!existingProfile,
      profile: existingProfile 
    });
    
  } catch (error) {
    console.error("Error checking health profile:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}