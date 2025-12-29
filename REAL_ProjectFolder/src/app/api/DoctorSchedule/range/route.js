import dbConnect from "../../../../lib/mongodb";
import DoctorSchedule from "../../../../models/DoctorSchedule";

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const schedule = await DoctorSchedule.find({
    scheduled_date: { $gte: new Date(start), $lte: new Date(end) },
  })
    .populate("patient_id")
    .sort({ scheduled_date: 1, start_time: 1 });

  return Response.json(schedule);
}
