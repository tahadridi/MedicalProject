// app/api/health/save/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HealthProfile from "@/models/HealthProfile";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    console.log("Received data:", body); // Add logging
    
    const { cin,email, ...profile } = body;

    if (!cin) {
      return NextResponse.json(
        { error: "CIN is required" },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existing = await HealthProfile.findOne({ userCin: cin });
    
    if (existing) {
      console.log("Updating existing profile for CIN:", cin);
       existing.set({
    userEmail: email, 
    ...profile
  });
      await existing.save();
      return NextResponse.json({ 
        message: "Profile updated successfully ✔️",
        updated: true 
      });
    }

    // Create new profile
    console.log("Creating new profile for CIN:", cin);
    await HealthProfile.create({
      userCin: cin,
      userEmail: email,
      ...profile,
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      message: "Profile saved successfully ✔️",
      created: true 
    });
  } catch (e) {
    console.error("Save error:", e);
    return NextResponse.json(
      { error: "Server error: " + e.message }, 
      { status: 500 }
    );
  }
}