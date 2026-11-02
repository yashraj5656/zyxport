// app/api/admin/winners/[id]/pay/route.js
import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import Winner from "@/models/Winner";

export async function PATCH(req, { params }) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const { paidToBank, payoutReference } = await req.json();

  await dbConnect();
  const winner = await Winner.findById(id);

  if (!winner) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  winner.paidToBank = paidToBank === true;
  winner.paidAt = paidToBank ? new Date() : null;
  winner.paidBy = paidToBank ? guard.user?._id : null;
  winner.payoutReference = paidToBank ? (payoutReference || "") : "";

  await winner.save();

  return Response.json({
    winner: { ...winner.toObject(), id: winner._id.toString() },
  });
}