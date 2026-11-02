import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  await dbConnect();
  const list = await Tournament.find().sort({ startTime: 1 }).lean();

  return Response.json({
    tournaments: list.map((t) => ({
      ...t,
      _id: t._id.toString(),
      createdAt: t.createdAt?.toISOString(),
      updatedAt: t.updatedAt?.toISOString(),
      startTime: t.startTime?.toISOString(),
    })),
  });
}

export async function POST(req) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();

    const required = ["name", "mode", "map", "entry", "prize", "slots", "date", "startTime"];
    for (const key of required) {
      if (body[key] === undefined || body[key] === "") {
        return Response.json({ error: `${key} is required` }, { status: 400 });
      }
    }

    await dbConnect();
    const t = await Tournament.create({
      name: body.name,
      mode: body.mode,
      map: body.map,
      entry: Number(body.entry),
      prize: Number(body.prize),
      slots: Number(body.slots),
      filled: Number(body.filled || 0),
      date: body.date,
      startTime: new Date(body.startTime),
      status: body.status || "Open",
      color: body.color || "green",
      roomId: body.roomId || "",
roomPassword: body.roomPassword || "",
    });

    return Response.json({ tournament: { ...t.toObject(), _id: t._id.toString() } });
  } catch (err) {
    console.error("Create tournament error:", err);
    return Response.json({ error: "Failed to create" }, { status: 500 });
  }
}