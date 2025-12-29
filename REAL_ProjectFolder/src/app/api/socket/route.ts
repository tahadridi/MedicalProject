// app/api/socket/route.ts
import { NextRequest, NextResponse } from "next/server";

// Cette route est nécessaire pour éviter l'erreur 404
// mais la vraie connexion Socket.IO se fait via le serveur HTTP
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: "Socket.IO endpoint",
    status: "active" 
  });
}