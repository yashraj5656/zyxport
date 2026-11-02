// app/api/admin/winners/[id]/route.js
import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import Winner from "@/models/Winner";

export async function DELETE(req, { params }) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  await dbConnect();
  await Winner.findByIdAndDelete(id);
  return Response.json({ success: true });
}