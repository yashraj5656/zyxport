// app/api/organizer/winners/route.js
import { requireOrganizer } from "@/lib/requireOrganizer";
import dbConnect from "@/lib/mongodb";
import Winner from "@/models/Winner";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const guard = await requireOrganizer();
    if (guard.error) return Response.json({ error: guard.error }, { status: guard.status });

    const { registrationId, tournamentId, prizeAmount, rank } = await req.json();
    await dbConnect();

    // 1. Verify the tournament belongs to the organizer
    const tournament = await Tournament.findOne({ _id: tournamentId, organizer: guard.user._id });
    if (!tournament) return Response.json({ error: "Unauthorized" }, { status: 403 });

    // 2. 👈 CHECK: Has a winner already been declared for this tournament?
    const existingWinner = await Winner.findOne({ tournament: tournamentId });
    if (existingWinner) {
      return Response.json({ error: "A winner has already been declared for this tournament." }, { status: 400 });
    }

    const reg = await Registration.findById(registrationId);
    if (!reg) return Response.json({ error: "Registration not found" }, { status: 404 });

    // 3. Create Winner record
    await Winner.create({
      tournament: tournamentId,
      user: reg.user,
      rank: Number(rank) || 1,
      prizeAmount: Number(prizeAmount),
      kills: 0, 
      paidToBank: false,
    });

    // 4. Mark tournament completed (this hides it from the public list)
    tournament.status = "Completed";
    await tournament.save();

    return Response.json({ success: true });
  } catch (err) {
    console.error("Winner declaration error:", err);
    return Response.json({ error: "Failed to declare winner" }, { status: 500 });
  }
}