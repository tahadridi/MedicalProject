import dbConnect from "../../../lib/mongodb";
import DoctorNote from "../../../models/DoctorNote";

export async function GET() {
  try {
    await dbConnect();
    const notes = await DoctorNote.find().populate("patient_id");
    return Response.json(notes);
  } catch {
    return Response.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const note = await DoctorNote.create(data);
    await note.populate("patient_id");
    return Response.json(note, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create note" }, { status: 500 });
  }
}
