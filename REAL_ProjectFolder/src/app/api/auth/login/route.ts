// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Medecin from "@/models/Medecin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    await dbConnect();

    // 1️⃣ Vérifier d'abord dans la table Medecins
    const medecin = await Medecin.findOne({ email });

    if (medecin) {
      // C'est un médecin - vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, medecin.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { 
            error: "Mot de passe incorrect",
            message: "Le mot de passe saisi est incorrect."
          },
          { status: 401 }
        );
      }

      // Générer token pour médecin
      const tokenPayload = {
        id: medecin._id,
        email: medecin.email,
        nom: medecin.nom,
        prenom: medecin.prenom,
        specialite: medecin.specialite,
        cin: medecin.cin,
        role: 'medecin',
        isMedecin: true
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return NextResponse.json({
        message: "Login réussi - Médecin",
        token,
        user: {
          id: medecin._id,
          email: medecin.email,
          nom: medecin.nom,
          prenom: medecin.prenom,
          fullName: `Dr. ${medecin.prenom} ${medecin.nom}`,
          specialite: medecin.specialite,
          hopital: medecin.hopital,
          departement: medecin.departement,
          telephone: medecin.telephone,
          cin: medecin.cin,
          role: 'medecin',
          isMedecin: true,
          avatar: (medecin.prenom?.charAt(0) || 'D') + (medecin.nom?.charAt(0) || 'R')
        }
      }, { status: 200 });

    } else {
      // 2️⃣ Si pas trouvé dans Medecins, vérifier dans Users (patients)
      const user = await User.findOne({ email });

      if (!user) {
        return NextResponse.json(
          { 
            error: "Compte non trouvé",
            message: "Aucun compte trouvé avec cet email."
          },
          { status: 404 }
        );
      }

      // Vérifier mot de passe pour patient
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { 
            error: "Mot de passe incorrect",
            message: "Le mot de passe saisi est incorrect."
          },
          { status: 401 }
        );
      }

      // Générer token pour patient
      const tokenPayload = {
        id: user._id,
        email: user.email,
        cin: user.cin,
        role: 'patient',
        isMedecin: false
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return NextResponse.json({
        message: "Login réussi - Patient",
        token,
        user: {
          id: user._id,
          email: user.email,
          cin: user.cin,
          role: 'patient',
          isMedecin: false
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}