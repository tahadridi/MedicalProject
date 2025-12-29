// lib/auth.ts
import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import User from "@/models/User";

export interface DecodedToken {
  id: string;
  email: string;
  cin: string;
}

// Version originale pour NextApiRequest (Pages Router)
export const verifyToken = async (req: NextApiRequest): Promise<DecodedToken | null> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    
    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    if (!user) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

// Nouvelle version pour App Router - accepte directement un token string
export const verifyTokenFromString = async (token: string): Promise<DecodedToken | null> => {
  try {
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    
    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    if (!user) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};
// lib/auth/logout.ts
export const logoutUser = async (redirectToLogin = true) => {
  try {
    // Clear client-side storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Call server logout endpoint
    await fetch('/api/auth/logout', { method: 'POST' });
    
    if (redirectToLogin) {
      window.location.href = '/login';
    }
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

// Function to clear only user data (for account switching)
export const clearUserData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('doctorData');
  localStorage.removeItem('cin');
  
  // Clear any data with specific prefixes
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('nexus_') || key.startsWith('auth_') || key.startsWith('doctor_')) {
      localStorage.removeItem(key);
    }
  });
  
  return true;
};