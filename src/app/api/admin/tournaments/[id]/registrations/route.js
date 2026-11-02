// app/api/admin/tournaments/[id]/registrations/route.js
import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  await dbConnect();

  const regs = await Registration.find({ tournament: id })
    .populate("user", "name email")   // 👈 critical
    .lean();

  return Response.json({
    registrations: regs.map((r) => ({
      id: r._id.toString(),
      ign: r.ign || "",
      uid: r.uid || "",
      paymentStatus: r.paymentStatus,
      user: r.user
        ? {
            id: r.user._id.toString(),   // 👈 explicit, never undefined
            name: r.user.name || "",
            email: r.user.email || "",
          }
        : null,
    })),
  });
}