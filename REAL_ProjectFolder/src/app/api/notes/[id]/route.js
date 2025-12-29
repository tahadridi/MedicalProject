import dbConnect from "../../../../lib/mongodb"
import DoctorNote from "../../../../models/DoctorNote";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const note = await DoctorNote.findById(params.id).populate("patient_id");
    if (!note) return Response.json({ message: "Not found" }, { status: 404 });
    return Response.json(note);
  } catch {
    return Response.json({ error: "Error fetching note" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const data = await request.json();
    const updated = await DoctorNote.findByIdAndUpdate(params.id, data, { new: true }).populate("patient_id");
    if (!updated) return Response.json({ message: "Not found" }, { status: 404 });
    return Response.json(updated);
  } catch {
    return Response.json({ error: "Error updating note" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const del = await DoctorNote.findByIdAndDelete(params.id);
    if (!del) return Response.json({ message: "Not found" }, { status: 404 });
    return Response.json({ message: "Note deleted" });
  } catch {
    return Response.json({ error: "Error deleting note" }, { status: 500 });
  }
}
