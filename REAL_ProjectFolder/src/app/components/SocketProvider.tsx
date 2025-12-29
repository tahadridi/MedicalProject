// components/SocketProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export default function SocketProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isConnected, setIsConnected] = useState(false);

  // Socket.IO désactivé temporairement
  useEffect(() => {
    console.log("Socket.IO désactivé - utilisation du polling");
    setIsConnected(false);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: null, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}