import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Registration from "@/models/Registration";
import User from "@/models/User";

export async function POST(req, { params }) {
  const { id } = await params;

  try {
    const auth = await getAuthUser();
    if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { ign, uid } = body;

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
      if (existing.paymentStatus === "paid") {
        return Response.json({ error: "Already registered" }, { status: 400 });
      }
      // Reuse pending registration
      existing.ign = ign;
      existing.uid = uid;
      await existing.save();
      return Response.json({
        registrationId: existing._id.toString(),
        paymentUrl: `/tournaments/${id}/pay`,
        amount: tournament.entry,
      });
    }

    const reg = await Registration.create({
      user: auth.userId,
      tournament: tournament._id,
      ign,
      uid,
      amount: tournament.entry,
      paymentStatus: "pending",
    });

    return Response.json({
      registrationId: reg._id.toString(),
      paymentUrl: `/tournaments/${id}/pay`,
      amount: tournament.entry,
    });
  } catch (err) {
    console.error("Register error:", err);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}