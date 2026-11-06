import crypto from "crypto";
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(req) {
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
  const user = await User.findById(auth.userId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  // Add 30 days to today's date
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  user.isOrganizer = true;
  user.subscriptionExpiry = expiryDate;
  user.subscriptionId = razorpay_payment_id;
  await user.save();

  return Response.json({ success: true, expiry: expiryDate });
}