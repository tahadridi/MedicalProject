import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, cin, email, password } = await req.json();

    /* ===========================
       🔍 1 — VALIDATION DES CHAMPS
       =========================== */

    if (!username || !cin || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    /* ===========================
       🔍 2 — VALIDATION USERNAME
       =========================== */

    // min/max length
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: "Username must be between 3 and 20 characters" },
        { status: 400 }
      );
    }

    // must start with a letter
    if (!/^[a-zA-Z]/.test(username)) {
      return NextResponse.json(
        { error: "Username must start with a letter" },
        { status: 400 }
      );
    }

    // only letters + numbers
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can contain only letters and numbers" },
        { status: 400 }
      );
    }

    /* ===========================
       🔍 3 — VALIDATION EMAIL
       =========================== */

if (!email.endsWith("@gmail.com") && !email.endsWith("@gmail.tn")) {
  return NextResponse.json(
    { error: "Only Gmail addresses (@gmail.com or @gmail.tn) are allowed" },
    { status: 400 }
  );
}


    /* ===========================
       🔍 4 — VALIDATION CIN
       =========================== */

    if (!/^\d{8}$/.test(cin)) {
      return NextResponse.json(
        { error: "CIN must be exactly 8 digits" },
        { status: 400 }
      );
    }

    /* ===========================
       🔍 5 — VALIDATION PASSWORD
       =========================== */

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    /* ===========================
       🔗 6 — CONNEXION BASE
       =========================== */
    await dbConnect();

    /* ===========================
       ❌ 7 — VÉRIFICATIONS EXISTANCE
       =========================== */

    // Email existe déjà ?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // CIN existe déjà ?
    const existingCin = await User.findOne({ cin });
    if (existingCin) {
      return NextResponse.json(
        { error: "CIN already used" },
        { status: 400 }
      );
    }

    /* ===========================
       🔐 8 — HACHER PASSWORD
       =========================== */
    const hashedPassword = await bcrypt.hash(password, 12);

    /* ===========================
       🧩 9 — CRÉATION UTILISATEUR
       =========================== */

    const newUser = await User.create({
      username,
      cin,
      email,
      password: hashedPassword,
    });

    /* ===========================
       🎉 10 — RÉPONSE SUCCESS
       =========================== */

    return NextResponse.json(
      {
        message: "User registered successfully ✅",
        userId: newUser._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error ❌" },
      { status: 500 }
    );
  }
}
