// app/api/admin/winners/route.js
import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import Winner from "@/models/Winner";
import BankDetail from "@/models/BankDetail";

export const dynamic = "force-dynamic";

// ───────────────────────────────────────────
// GET — list all winners (admin)
// ───────────────────────────────────────────
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  await dbConnect();

  const winners = await Winner.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("tournament", "name entry prize")
    .lean();

  const userIds = [
    ...new Set(
      winners
        .map((w) => (w.user ? w.user._id?.toString() : null))
        .filter(Boolean)
    ),
  ];

  const banks = await BankDetail.find({ user: { $in: userIds } }).lean();
  const bankMap = Object.fromEntries(
    banks.map((b) => [b.user.toString(), b])
  );

  const enriched = winners.map((w) => {
    const uid = w.user ? w.user._id.toString() : null;
    const bank = uid ? bankMap[uid] : null;
    return {
      id: w._id.toString(),
      rank: w.rank,
      prizeAmount: w.prizeAmount,
      kills: w.kills,
      paidToBank: w.paidToBank,
      paidAt: w.paidAt?.toISOString() || null,
      payoutReference: w.payoutReference || "",
      createdAt: w.createdAt?.toISOString(),
      user: w.user
        ? {
            id: w.user._id.toString(),
            name: w.user.name,
            email: w.user.email,
          }
        : null,
      tournament: w.tournament
        ? {
            id: w.tournament._id.toString(),
            name: w.tournament.name,
            prize: w.tournament.prize,
          }
        : null,
      bank: bank
        ? {
            accountHolderName: bank.accountHolderName,
            accountNumber: bank.accountNumber,
            ifscCode: bank.ifscCode,
            bankName: bank.bankName,
            upiId: bank.upiId || "",
          }
        : null,
    };
  });

  return Response.json({ winners: enriched });
}

// ───────────────────────────────────────────
// POST — create a new winner
// ───────────────────────────────────────────
export async function POST(req) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const { tournamentId, userId, rank, prizeAmount, kills } = body;

    if (!tournamentId || !userId || !rank || prizeAmount === undefined) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Prevent duplicate (one winner record per tournament + user)
    const existing = await Winner.findOne({
      tournament: tournamentId,
      user: userId,
    });
    if (existing) {
      return Response.json(
        {
          error:
            "This user is already marked as a winner for this tournament",
        },
        { status: 400 }
      );
    }

    const winner = await Winner.create({
      tournament: tournamentId,
      user: userId,
      rank: Number(rank),
      prizeAmount: Number(prizeAmount),
      kills: Number(kills || 0),
    });

    return Response.json({
      winner: {
        ...winner.toObject(),
        id: winner._id.toString(),
      },
    });
  } catch (err) {
    console.error("Create winner error:", err);
    return Response.json(
      { error: err.message || "Failed to create" },
      { status: 500 }
    );
  }
}