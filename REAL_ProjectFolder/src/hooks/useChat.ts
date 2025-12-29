// src/hooks/useChat.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Message {
  _id: string;
  sender: { _id: string; username: string };
  content: string;
  createdAt: string;
}

interface UseChatReturn {
  messages: Message[];
  sendMessage: (content: string, roomId: string, receiverId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useChat(roomId: string | null): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les messages initiaux
  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    
    try {
      const response = await axios.get(`/api/messages?roomId=${roomId}`);
      setMessages(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des messages');
      console.error('Erreur chargement messages:', err);
    }
  }, [roomId]);

  // Polling pour les nouveaux messages
  useEffect(() => {
    if (!roomId) return;

    loadMessages();

    const interval = setInterval(loadMessages, 2000); // Poll toutes les 2 secondes

    return () => clearInterval(interval);
  }, [roomId, loadMessages]);

  // Envoyer un message
  const sendMessage = async (content: string, roomId: string, receiverId: string) => {
    if (!content.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages', {
        content,
        roomId,
        receiverId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Recharger les messages après envoi
      await loadMessages();
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      console.error('Erreur envoi message:', err);
    }
  };

  return { messages, sendMessage, loading, error };
}