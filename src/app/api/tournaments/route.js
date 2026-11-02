// app/api/tournaments/route.js
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

export const dynamic = "force-dynamic";

// ─── Keep only the sponsor fields the client needs ─────
function pickSponsors(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((s) => s && s.name)
    .map((s) => ({
      name: s.name,
      tagline: s.tagline || "",
      href: s.href || "#",
      logo: s.logo || "🎯",
      tier: ["title", "gold", "community"].includes(s.tier)
        ? s.tier
        : "gold",
    }));
}

export async function GET() {
  try {
    await dbConnect();

    const list = await Tournament.find({
      status: { $nin: ["Completed", "Cancelled"] },
    })
      .sort({ startTime: 1 })
      .limit(50)
      .select("-roomId -roomPassword")
      .lean();

    return Response.json({
      tournaments: list.map((t) => ({
        id: t._id.toString(),
        name: t.name,
        mode: t.mode,
        map: t.map,
        prize: t.prize,
        slots: t.slots,
        filled: t.filled,
        date: t.date,
        startTime: t.startTime?.toISOString() || null,   // 👈 added
        status: t.status,
        color: t.color,
        sponsors: pickSponsors(t.sponsors),              // 👈 sanitized
      })),
    });
  } catch (err) {
    console.error("Public tournaments fetch error:", err);
    return Response.json(
      { error: "Failed to load tournaments", tournaments: [] },
      { status: 500 }
    );
  }
}