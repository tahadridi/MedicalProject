// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/mongodb";
// import User from "@/models/User";

// export async function GET() {
//   try {
//     await dbConnect();
//     // Njibou kan l 3bed illi role mta3hom "medecin"
//     // w na7ou l password mel retour bch mayetra9ech
//     const medecins = await User.find({ role: "medecin" }).select("-password");

//     return NextResponse.json(medecins);
//   } catch (error) {
//     return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
//   }
// }