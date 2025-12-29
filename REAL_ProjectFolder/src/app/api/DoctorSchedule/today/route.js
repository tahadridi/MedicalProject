import dbConnect from "../../../../lib/mongodb";
import DoctorSchedule from "../../../../models/DoctorSchedule";
import Patient from "../../../../models/patients";
export async function GET() {
  await dbConnect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const schedule = await DoctorSchedule.find({
    scheduled_date: { $gte: today, $lt: tomorrow },
  })
    .populate("patient_id")
    .sort({ start_time: 1 });

  return Response.json(schedule);
}
