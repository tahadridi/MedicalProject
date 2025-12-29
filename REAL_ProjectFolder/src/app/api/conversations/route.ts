import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { verifyTokenFromString } from "@/lib/auth";
import Message from "@/models/Message";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await verifyTokenFromString(token);
    if (!user) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const conversations = await Conversation.find({
      participants: user.id
    })
    .populate('participants', 'username email role')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Erreur API conversations:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await verifyTokenFromString(token);
    if (!user) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { participantId } = await request.json();
    
    if (!participantId) {
      return NextResponse.json({ error: "participantId manquant" }, { status: 400 });
    }

    const roomId = [user.id, participantId].sort().join('_');
    
    let conversation = await Conversation.findOne({ roomId })
      .populate('participants', 'username email role');
    console.log("🧪 CREATE CONVERSATION", {
  creator: user.id,
  participantId,
  roomId
});

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [user.id, participantId],
        roomId
      });
      console.log("🧪 SAVED CONVERSATION", conversation);

      
      conversation = await conversation.populate('participants', 'username email role');
    }
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Erreur création conversation:", error);
    return NextResponse.json(
      { error: "Erreur création conversation" },
      { status: 500 }
    );
  }
  
}