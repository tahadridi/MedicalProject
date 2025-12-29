import dbConnect from "../../../../lib/mongodb";
import Patient from "../../../../models/patients"

export async function GET(request, { params }) {
  try {
    const { id } =  await params; // Use the awaited version
    await dbConnect();
    const patient = await Patient.findById(id); // Use the destructured id
    if (!patient) return Response.json({ message: "Not found" }, { status: 404 });
    return Response.json(patient);
  } catch {
    return Response.json({ error: "Error fetching patient" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params; // Use the awaited version
    await dbConnect();
    const data = await request.json();
    const patient = await Patient.findByIdAndUpdate(id, data, { new: true }); // Use the destructured id
    if (!patient) return Response.json({ message: "Not found" }, { status: 404 });
    return Response.json(patient);
  } catch (error) {
    return Response.json({ message: "Error updating patient" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Use the awaited version
    await dbConnect();
    const patient = await Patient.findByIdAndDelete(id); // Use the destructured id
    if (!patient) return Response.json({ message: "Not found" }, { status: 404 });
    return Response.json({ message: "Patient deleted" });
  } catch {
    return Response.json({ error: "Error deleting patient" }, { status: 500 });
  }
}