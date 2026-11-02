import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

export async function PATCH(req, { params }) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const updates = {};

    for (const key of ["name", "mode", "map", "date", "status", "color", "roomId", "roomPassword"]) {
      if (typeof body[key] === "string") updates[key] = body[key];
    }
    for (const key of ["entry", "prize", "slots", "filled"]) {
      if (body[key] !== undefined) updates[key] = Number(body[key]);
    }
    if (body.startTime) updates.startTime = new Date(body.startTime);

    await dbConnect();
    const t = await Tournament.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!t) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ tournament: { ...t.toObject(), _id: t._id.toString() } });
  } catch (err) {
    console.error("Update error:", err);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  await dbConnect();
  const deleted = await Tournament.findByIdAndDelete(id);

  if (!deleted) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}