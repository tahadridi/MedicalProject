/// app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { verifyTokenFromString } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
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

    // Récupérer la conversation SANS populate d'abord
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: user.id
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    console.log("📋 Participants bruts:", conversation.participants);

    // Populate manuellement pour gérer les utilisateurs manquants
    const User = mongoose.model('User');
    
    const populatedParticipants = await Promise.all(
      conversation.participants.map(async (userId: any) => {
        try {
          const userDoc = await User.findById(userId)
            .select('username email role nom prenom specialite')
            .lean();
          
          if (!userDoc) {
            console.log(`⚠️ Utilisateur ${userId} non trouvé, création d'un objet temporaire`);
            return {
              _id: userId,
              username: userId === user.id ? user.username : 'Utilisateur inconnu',
              email: '',
              role: 'unknown',
              nom: '',
              prenom: '',
              specialite: ''
            };
          }
          return userDoc;
        } catch (error) {
          console.error(`❌ Erreur lors du chargement de l'utilisateur ${userId}:`, error);
          return {
            _id: userId,
            username: 'Erreur de chargement',
            email: '',
            role: 'error',
            nom: '',
            prenom: '',
            specialite: ''
          };
        }
      })
    );

    // Populate le lastMessage
    const Message = mongoose.model('Message');
    let lastMessage = null;
    
    if (conversation.lastMessage) {
      lastMessage = await Message.findById(conversation.lastMessage)
        .populate('sender', 'username nom prenom')
        .populate('receiver', 'username nom prenom')
        .lean();
    }

    const responseConversation = {
      _id: conversation._id,
      participants: populatedParticipants,
      roomId: conversation.roomId,
      lastMessage,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      __v: conversation.__v
    };

    console.log(`✅ Conversation chargée avec ${populatedParticipants.length} participants`);
    
    return NextResponse.json(responseConversation);
  } catch (error) {
    console.error("❌ Erreur API conversation individuelle:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}