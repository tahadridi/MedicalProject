import dbConnect from "../../../../lib/mongodb";
import Prescription from "../../../models/Prescription";

export async function GET(request, { params }) {
  await dbConnect();
  const item = await Prescription.findById(params.id).populate("patient_id");
  if (!item) return Response.json({ message: "Not found" }, { status: 404 });
  return Response.json(item);
}

export async function PUT(request, { params }) {
  await dbConnect();
  const data = await request.json();
  const updated = await Prescription.findByIdAndUpdate(params.id, data, { new: true }).populate("patient_id");
  if (!updated) return Response.json({ message: "Not found" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const deleted = await Prescription.findByIdAndDelete(params.id);
  if (!deleted) return Response.json({ message: "Not found" }, { status: 404 });
  return Response.json({ message: "Deleted successfully" });
}
