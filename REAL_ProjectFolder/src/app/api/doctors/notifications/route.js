// app/api/notifications/doctor/route.js
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';

export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const notification = new Notification(data);
    await notification.save();
    
    return Response.json({ 
      success: true, 
      notification 
    });
    
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}