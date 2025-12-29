/// app/api/messages/route.ts (version mise à jour)
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { verifyTokenFromString } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: "roomId manquant" }, { status: 400 });
    }

    const messages = await Message.find({ roomId })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: 1 });
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erreur API messages:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Vérifier le token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await verifyTokenFromString(token);
    if (!user) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const { content, roomId, receiverId } = await request.json();
    
    if (!content || !roomId) {
      return NextResponse.json(
        { error: "Contenu et roomId requis" }, 
        { status: 400 }
      );
    }
    

    // Créer le message
    const newMessage = await Message.create({
      sender: user.id,
      receiver: receiverId,
      roomId,
      content
    });

    // Mettre à jour la conversation
   await Conversation.findOneAndUpdate(
  { roomId },
  {
    $addToSet: {
      participants: { $each: [user.id, receiverId] }
    },
    lastMessage: newMessage._id
  },
  { new: true }
);


    // Retourner le message peuplé
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username')
      .populate('receiver', 'username');

    return NextResponse.json(populatedMessage);
  } catch (error) {
    console.error("Erreur création message:", error);
    return NextResponse.json(
      { error: "Erreur création message" },
      { status: 500 }
    );
  }
}