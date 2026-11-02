// app/api/admin/registrations/route.js
import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  await dbConnect();

  // Optional query params: ?tournamentId=xxx&status=paid
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");
  const status = searchParams.get("status");

  const query = {};
  if (tournamentId) query.tournament = tournamentId;
  if (status) query.paymentStatus = status;

  const registrations = await Registration.find(query)
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean();

  // Collect unique IDs for batch lookups
  const userIds = [...new Set(registrations.map((r) => r.user.toString()))];
  const tournamentIds = [
    ...new Set(registrations.map((r) => r.tournament.toString())),
  ];

  const [users, tournaments] = await Promise.all([
    User.find({ _id: { $in: userIds } })
      .select("name email")
      .lean(),
    Tournament.find({ _id: { $in: tournamentIds } })
      .select("name startTime entry")
      .lean(),
  ]);

  const userMap = Object.fromEntries(
    users.map((u) => [u._id.toString(), u])
  );
  const tournamentMap = Object.fromEntries(
    tournaments.map((t) => [t._id.toString(), t])
  );

  // Attach user + tournament info to each registration
  const enriched = registrations.map((r) => {
    const u = userMap[r.user.toString()];
    const t = tournamentMap[r.tournament.toString()];
    return {
      id: r._id.toString(),
      paymentStatus: r.paymentStatus,
      amount: r.amount,
      ign: r.ign,
      uid: r.uid,
      createdAt: r.createdAt?.toISOString(),
      paidAt: r.paidAt?.toISOString() || null,
      user: u
        ? { id: u._id.toString(), name: u.name, email: u.email }
        : { id: r.user.toString(), name: "Deleted user", email: "—" },
      tournament: t
        ? {
            id: t._id.toString(),
            name: t.name,
            entry: t.entry,
            startTime: t.startTime?.toISOString(),
          }
        : {
            id: r.tournament.toString(),
            name: "Deleted tournament",
            entry: 0,
            startTime: null,
          },
    };
  });

  // Group by tournament
  const grouped = {};
  for (const reg of enriched) {
    const key = reg.tournament.id;
    if (!grouped[key]) {
      grouped[key] = {
        tournament: reg.tournament,
        registrations: [],
        stats: { total: 0, paid: 0, pending: 0, failed: 0, refunded: 0, revenue: 0 },
      };
    }
    grouped[key].registrations.push(reg);
    grouped[key].stats.total += 1;
    grouped[key].stats[reg.paymentStatus] =
      (grouped[key].stats[reg.paymentStatus] || 0) + 1;
    if (reg.paymentStatus === "paid") {
      grouped[key].stats.revenue += reg.amount;
    }
  }

  return Response.json({
    groups: Object.values(grouped),
    totals: {
      registrations: enriched.length,
      paid: enriched.filter((r) => r.paymentStatus === "paid").length,
      revenue: enriched
        .filter((r) => r.paymentStatus === "paid")
        .reduce((sum, r) => sum + r.amount, 0),
    },
  });
}