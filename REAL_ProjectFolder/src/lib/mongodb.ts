import mongoose from "mongoose";

// 🔗 MongoDB URI (from .env.local if exists, otherwise local default)
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://firasbouzainne7_db_user:firas123@cluster0.vsrofcf.mongodb.net/medecin_intelligent?retryWrites=true&w=majority&appName=Cluster0";
// 🧩 Ensure we have an URI
if (!MONGODB_URI) {
  throw new Error("❌ Please add your MongoDB URI to .env.local");
}

// 🔋 Keep connection state cached
let isConnected = false;

/**
 * 📦 Connect to MongoDB (reuse active connection to avoid reconnections)
 */
export default async function dbConnect() {
  if (isConnected) {
    console.log("⚡ Using existing MongoDB connection");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);

    isConnected = !!db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}
