import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();

  const list = await Tournament.find({
    status: { $nin: ["Completed", "Cancelled"] },
  })
    .sort({ startTime: 1 })
    .limit(50)
    .select("-roomId -roomPassword")  
    .lean();

  return Response.json({
    tournaments: list.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      mode: t.mode,
      map: t.map,
      entry: t.entry,
      prize: t.prize,
      slots: t.slots,
      filled: t.filled,
      date: t.date,
      status: t.status,
      color: t.color,
    })),
  });
}