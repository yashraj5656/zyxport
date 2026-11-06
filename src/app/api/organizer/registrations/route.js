// app/api/organizer/registrations/route.js
import { requireOrganizer } from "@/lib/requireOrganizer";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const guard = await requireOrganizer();
    if (guard.error) return Response.json({ error: guard.error }, { status: guard.status });

    await dbConnect();
    
    const myTournaments = await Tournament.find({ organizer: guard.user._id }).select("_id");
    const ids = myTournaments.map(t => t._id);

    const regs = await Registration.find({ tournament: { $in: ids } })
      .populate("user", "name email")
      .populate("tournament", "name prize status") // 👈 Make sure status is populated
      .lean();

    return Response.json({
      registrations: regs.map(r => ({
        _id: r._id.toString(),
        ign: r.ign,
        uid: r.uid,
        user: r.user ? { name: r.user.name, email: r.user.email } : null,
        tournament: r.tournament ? { 
          _id: r.tournament._id.toString(), 
          name: r.tournament.name,
          prize: r.tournament.prize,
          status: r.tournament.status // 👈 Send status to frontend
        } : null,
      }))
    });
  } catch (err) {
    return Response.json({ error: "Failed to load registrations" }, { status: 500 });
  }
}