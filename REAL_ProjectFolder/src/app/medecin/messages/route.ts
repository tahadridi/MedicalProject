// app/api/medecin/messages/route.ts (updated)
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { verifyTokenFromString } from "@/lib/auth";
import Patient from "@/models/patients";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const roomId = searchParams.get('roomId');

    // Get doctor from token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const doctor = await verifyTokenFromString(token);
    if (!doctor) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    let queryRoomId;
    
    // Handle both patientId and roomId parameters
    if (patientId) {
      // Verify patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return NextResponse.json({ error: "Patient non trouvé" }, { status: 404 });
      }
      queryRoomId = [doctor.id, patientId].sort().join('_');
    } else if (roomId) {
      queryRoomId = roomId;
    } else {
      return NextResponse.json({ error: "patientId ou roomId manquant" }, { status: 400 });
    }

    const messages = await Message.find({ roomId: queryRoomId })
      .populate('sender', 'username email nom prenom role')
      .populate('receiver', 'username email nom prenom role')
      .sort({ createdAt: 1 });
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erreur API medecin messages:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Vérifier le token docteur
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const doctor = await verifyTokenFromString(token);
    if (!doctor) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const body = await request.json();
    const { content, patientId, roomId, receiverId } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: "Contenu requis" }, 
        { status: 400 }
      );
    }

    let finalPatientId;
    let finalRoomId;
    
    // Handle different input formats
    if (patientId) {
      // Format 1: Direct patientId
      finalPatientId = patientId;
      
      // Verify patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return NextResponse.json({ error: "Patient non trouvé" }, { status: 404 });
      }
      
      finalRoomId = [doctor.id, patientId].sort().join('_');
    } else if (roomId && receiverId) {
      // Format 2: roomId and receiverId (from frontend)
      finalPatientId = receiverId;
      finalRoomId = roomId;
      
      // Verify patient exists
      const patient = await Patient.findById(receiverId);
      if (!patient) {
        return NextResponse.json({ error: "Patient non trouvé" }, { status: 404 });
      }
    } else {
      return NextResponse.json(
        { error: "patientId ou roomId+receiverId requis" }, 
        { status: 400 }
      );
    }

    // Créer le message
    const newMessage = await Message.create({
      sender: doctor.id,
      receiver: finalPatientId,
      roomId: finalRoomId,
      content
    });

    // Mettre à jour ou créer la conversation
    await Conversation.findOneAndUpdate(
      { roomId: finalRoomId },
      {
        $addToSet: {
          participants: { $each: [doctor.id, finalPatientId] }
        },
        lastMessage: newMessage._id
      },
      { upsert: true, new: true }
    );

    // Retourner le message peuplé
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username email nom prenom role')
      .populate('receiver', 'username email nom prenom role');

    return NextResponse.json(populatedMessage);
  } catch (error) {
    console.error("Erreur création message docteur:", error);
    return NextResponse.json(
      { error: "Erreur création message" },
      { status: 500 }
    );
  }
}