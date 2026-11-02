// app/api/profile/bank/route.js
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import BankDetail from "@/models/BankDetail";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  await dbConnect();
  const bank = await BankDetail.findOne({ user: auth.userId }).lean();

  return Response.json({ bank });
}

export async function PUT(req) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = body;

  if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
    return Response.json({ error: "All fields required" }, { status: 400 });
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifscCode.trim())) {
    return Response.json({ error: "Invalid IFSC code" }, { status: 400 });
  }

  await dbConnect();

  const bank = await BankDetail.findOneAndUpdate(
    { user: auth.userId },
    {
      user: auth.userId,
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      bankName: bankName.trim(),
      upiId: (upiId || "").trim(),
      updatedAt: new Date(),
    },
    { new: true, upsert: true }
  );

  return Response.json({ bank });
}