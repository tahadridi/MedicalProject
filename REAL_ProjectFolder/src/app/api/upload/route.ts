/// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/mongodb";
import { verifyTokenFromString } from "@/lib/auth";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const content = formData.get("content") as string;
    const roomId = formData.get("roomId") as string;
    const receiverId = formData.get("receiverId") as string;

    if (!file || !roomId || !receiverId) {
      return NextResponse.json(
        { error: "Fichier, roomId et receiverId requis" },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 10MB)
    const fileSize = file.size;
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier ne doit pas dépasser 10MB" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé" },
        { status: 400 }
      );
    }

    // Générer un nom unique pour le fichier
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Créer le chemin de destination
    const filePath = join(uploadDir, uniqueFileName);
    
    // Écrire le fichier
    await writeFile(filePath, buffer);
    
    // URL accessible via le web
    const fileUrl = `/uploads/${uniqueFileName}`;
    
    // Créer le message avec le fichier
    const newMessage = await Message.create({
      sender: user.id,
      receiver: receiverId,
      roomId,
      content: content || `📎 ${file.name}`,
      fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: fileSize
    });

    // Mettre à jour la conversation
    await Conversation.findOneAndUpdate(
      { roomId },
      { lastMessage: newMessage._id }
    );

    // Retourner le message peuplé
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username')
      .populate('receiver', 'username');

    return NextResponse.json(populatedMessage);
  } catch (error) {
    console.error("Erreur upload fichier:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}