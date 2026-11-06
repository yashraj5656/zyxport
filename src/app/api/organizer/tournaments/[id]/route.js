// app/api/organizer/tournaments/[id]/route.js
import { requireOrganizer } from "@/lib/requireOrganizer";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const guard = await requireOrganizer();
    if (guard.error) return Response.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;
    await dbConnect();

    // 👈 Allow Admins to edit anything, Organizers only their own
    const query = guard.user.isAdmin ? { _id: id } : { _id: id, organizer: guard.user._id };
    const tournament = await Tournament.findOne(query);
    
    if (!tournament) return Response.json({ error: "Not found or unauthorized" }, { status: 404 });

    const body = await req.json();
    
    // 👈 Only update allowed fields (Blocks them from changing the prize)
    const allowedUpdates = [
      "name", "mode", "map", "slots", "filled", "date", "startTime", 
      "status", "color", "roomId", "roomPassword", "sponsors", "pageContent"
    ];

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        tournament[key] = body[key];
      }
    }

    await tournament.save();

    return Response.json({ 
      tournament: { ...tournament.toObject(), _id: tournament._id.toString() } 
    });
  } catch (err) {
    console.error("PATCH tournament error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const guard = await requireOrganizer();
    if (guard.error) return Response.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;
    await dbConnect();

    // 👈 Allow Admins to delete anything, Organizers only their own
    const query = guard.user.isAdmin ? { _id: id } : { _id: id, organizer: guard.user._id };
    const deleted = await Tournament.findOneAndDelete(query);
    
    if (!deleted) return Response.json({ error: "Not found or unauthorized" }, { status: 404 });

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE tournament error:", err);
    return Response.json({ error: "Failed to delete" }, { status: 500 });
  }
}