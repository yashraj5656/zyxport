import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  await dbConnect();
  const messages = await ContactMessage.find()
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  return Response.json({
    messages: messages.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      status: m.status,
      createdAt: m.createdAt?.toISOString(),
    })),
  });
}