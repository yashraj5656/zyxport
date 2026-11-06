import Razorpay from "razorpay";
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  await dbConnect();
  const user = await User.findById(auth.userId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  try {
    const order = await razorpay.orders.create({
      amount: 79900, // 799 INR in paise
      currency: "INR",
      receipt: `org_sub_${user._id}`,
      notes: { userId: user._id.toString(), type: "organizer_monthly" },
    });

    return Response.json({ 
      orderId: order.id, 
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID 
    });
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    return Response.json({ error: "Could not create order" }, { status: 500 });
  }
}