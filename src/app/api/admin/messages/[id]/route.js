import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

export const dynamic = "force-dynamic"; 

export async function PATCH(req, { params }) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["new", "read", "replied"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  await dbConnect();
  const msg = await ContactMessage.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!msg) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ success: true });
}

export async function DELETE(req, { params }) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  await dbConnect();
  await ContactMessage.findByIdAndDelete(id);
  return Response.json({ success: true });
}s