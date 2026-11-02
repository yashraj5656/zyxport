// app/api/tournaments/[id]/verify/route.js
import crypto from "crypto";
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";

export async function POST(req, { params }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  await dbConnect();
  const reg = await Registration.findOne({ user: auth.userId, tournament: id });
  if (!reg) return Response.json({ error: "Registration not found" }, { status: 404 });

  reg.paymentStatus = "paid";
  reg.paidAt = new Date();
  reg.paymentId = razorpay_payment_id;
  await reg.save();

  await Tournament.findByIdAndUpdate(id, { $inc: { filled: 1 } });

  return Response.json({ success: true });
}