import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Registration from "@/models/Registration";

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const auth = await getAuthUser();
    if (!auth) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const registration = await Registration.findOne({
      user: auth.userId,
      tournament: id,
      paymentStatus: "paid",
    }).lean();

    if (!registration) {
      return Response.json(
        { error: "Payment required", paid: false },
        { status: 403 }
      );
    }

    const tournament = await Tournament.findById(id)
      .select("roomId roomPassword name")
      .lean();

    if (!tournament) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    if (!tournament.roomId) {
      return Response.json({
        paid: true,
        roomId: "",
        roomPassword: "",
        message: "Room details not published yet. Check back before match start.",
      });
    }

    return Response.json({
      paid: true,
      roomId: tournament.roomId,
      roomPassword: tournament.roomPassword,
    });
  } catch (err) {
    console.error("Room fetch error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}