// app/api/tournaments/[id]/register/route.js
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Registration from "@/models/Registration";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { id } = await params;

  try {
    const auth = await getAuthUser();
    if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const { ign, uid } = await req.json();
    if (!ign || !uid) {
      return Response.json({ error: "IGN and UID required" }, { status: 400 });
    }

    await dbConnect();

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return Response.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.filled >= tournament.slots) {
      return Response.json({ error: "Tournament is full" }, { status: 400 });
    }

    const existing = await Registration.findOne({
      user: auth.userId,
      tournament: tournament._id,
    });

    if (existing) {
      return Response.json(
        { error: "You are already registered for this tournament" },
        { status: 400 }
      );
    }

    // ✅ Free registration — mark as paid instantly
    await Registration.create({
      user: auth.userId,
      tournament: tournament._id,
      ign: ign.trim(),
      uid: uid.trim(),
      amount: 0,
      paymentStatus: "paid",
      paidAt: new Date(),
      paymentId: "FREE_ENTRY",
    });

    // Increment filled counter
    tournament.filled = Math.min(tournament.slots, tournament.filled + 1);
    await tournament.save();

    return Response.json({ success: true });
  } catch (err) {
    console.error("Register error:", err);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}