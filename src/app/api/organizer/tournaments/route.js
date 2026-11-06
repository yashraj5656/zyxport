// app/api/organizer/tournaments/route.js
import { requireOrganizer } from "@/lib/requireOrganizer";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

// Initialize Razorpay safely
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "missing_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "missing_secret",
});

export async function GET() {
  try {
    const guard = await requireOrganizer();
    if (guard.error) return Response.json({ error: guard.error }, { status: guard.status });

    await dbConnect();
    
    // 👈 THE FIX: Admins see everything, Organizers see only their own.
    const query = guard.user.isAdmin ? {} : { organizer: guard.user._id };
    
    const list = await Tournament.find(query)
      .sort({ startTime: -1 })
      .lean();

    return Response.json({ 
      tournaments: list.map(t => ({ 
        ...t, 
        _id: t._id.toString(),
        status: t.status || "Open" // Fallback if status is missing
      })) 
    });

  } catch (err) {
    console.error("GET Organizer Tournaments Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const guard = await requireOrganizer();
    if (guard.error) return Response.json({ error: guard.error }, { status: guard.status });

    const body = await req.json();
    await dbConnect();

    // Create the tournament (unpaid initially)
    const t = await Tournament.create({
      ...body,
      organizer: guard.user._id, // 👈 Securely bind the tournament to this user
      entry: 0,
      prizePaid: false,
      status: "Cancelled", // Hidden until paid
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Number(body.prize) * 100,
      currency: "INR",
      receipt: `prize_pool_${t._id}`,
      notes: { tournamentId: t._id.toString(), type: "prize_pool_deposit" },
    });

    return Response.json({ 
      tournament: { ...t.toObject(), _id: t._id.toString() }, 
      orderId: order.id, 
      amount: order.amount,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.error("POST Organizer Tournament Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}