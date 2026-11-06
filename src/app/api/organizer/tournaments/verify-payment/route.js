import crypto from "crypto";
import { requireOrganizer } from "@/lib/requireOrganizer";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

export async function POST(req) {
  const guard = await requireOrganizer();
  if (guard.error) return Response.json({ error: guard.error }, { status: guard.status });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tournamentId } = await req.json();

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  await dbConnect();
  // Mark as paid and set status to Open so it appears on the site
  await Tournament.findByIdAndUpdate(tournamentId, {
    prizePaid: true,
    status: "Open",
  });

  return Response.json({ success: true });
}