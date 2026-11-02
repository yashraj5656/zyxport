// app/api/tournaments/[id]/pay/route.js
import Razorpay from "razorpay";
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req, { params }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  await dbConnect();
  const tournament = await Tournament.findById(id);
  if (!tournament) return Response.json({ error: "Tournament not found" }, { status: 404 });

  const reg = await Registration.findOne({ user: auth.userId, tournament: id });
  if (!reg || reg.paymentStatus === "paid") {
    return Response.json({ error: "Invalid registration" }, { status: 400 });
  }

  // Create Razorpay Order (amount in paise)
  const order = await razorpay.orders.create({
    amount: tournament.entry * 100,
    currency: "INR",
    receipt: `reg_${reg._id}`,
    notes: { registrationId: reg._id.toString(), tournamentId: id },
  });

  return Response.json({ orderId: order.id, amount: order.amount });
}