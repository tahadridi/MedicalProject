// app/api/chat/stream/route.ts
import { NextRequest } from "next/server";

// Types pour les événements SSE
interface SSEEvent {
  type: string;
  timestamp: number;
  data?: unknown;
}

export async function GET(request: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (data: SSEEvent) => {
    const eventData = `data: ${JSON.stringify(data)}\n\n`;
    writer.write(encoder.encode(eventData));
  };

  // Garder la connexion ouverte
  const keepAlive = setInterval(() => {
    sendEvent({ type: 'ping', timestamp: Date.now() });
  }, 30000);

  // Nettoyage
  const cleanup = () => {
    clearInterval(keepAlive);
    writer.close();
  };

  request.signal.addEventListener('abort', cleanup);

  // Envoyer un événement de connexion initial
  sendEvent({ type: 'connected', timestamp: Date.now() });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}