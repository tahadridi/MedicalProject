// lib/socket-server.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import dbConnect from "./mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

// Types pour les données Socket.IO
interface MessageData {
  sender: string;
  receiver: string;
  roomId: string;
  content: string;
}

interface ServerTypes {
  server: HttpServer | HttpsServer;
}

let io: Server | null = null;

export function initSocketIO(server: HttpServer | HttpsServer) {
  if (io) {
    return io;
  }

  console.log("🔌 Initialisation du serveur Socket.IO...");

  io = new Server(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === "production" 
        ? "https://votre-domaine.com" 
        : "http://localhost:3000",
      methods: ["GET", "POST"]
    },
  });

  io.on("connection", (socket) => {
    console.log("📡 Client connecté :", socket.id);

    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`👤 User ${socket.id} a rejoint la salle : ${roomId}`);
    });

    socket.on("send_message", async (data: MessageData) => {
      try {
        await dbConnect();
        
        // Sauvegarder le message
        const newMessage = await Message.create({
          sender: data.sender,
          receiver: data.receiver,
          roomId: data.roomId,
          content: data.content
        });

        // Mettre à jour la dernière message de la conversation
        await Conversation.findOneAndUpdate(
          { roomId: data.roomId },
          { lastMessage: newMessage._id }
        );

        // Populer les données de l'expéditeur avant d'envoyer
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'username')
          .populate('receiver', 'username');

        // Diffuser le message à tous les participants de la room
        if (io) {
          io.to(data.roomId).emit("receive_message", populatedMessage);
        }
      } catch (error) {
        console.error("Erreur envoi message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client déconnecté:", socket.id);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO non initialisé");
  }
  return io;
}