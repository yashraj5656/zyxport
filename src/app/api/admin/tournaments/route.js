// app/api/admin/tournaments/route.js
import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// ─── Sanitize sponsors (drop blanks, validate tier) ────
function sanitizeSponsors(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((s) => ({
      name: (s?.name || "").trim(),
      tagline: (s?.tagline || "").trim(),
      href: (s?.href || "#").trim(),
      logo: (s?.logo || "🎯").trim(),
      tier: ["title", "gold", "community"].includes(s?.tier)
        ? s.tier
        : "gold",
    }))
    .filter((s) => s.name.length > 0);
}
// Helper
function sanitizePageContent(input) {
  if (!input || typeof input !== "object") return {};
  const out = {};
  const stringFields = [
    "brandName", "brandTagline", "brandSubTagline", "brandWebsite",
    "ctaEyebrow", "ctaTitleLine1", "ctaTitleLine2", "ctaSubtitle",
    "ctaPrimaryLabel", "ctaPrimaryHref", "ctaSecondaryLabel", "ctaSecondaryHref",
    "ctaHighlight1Value", "ctaHighlight1Label",
    "ctaHighlight2Value", "ctaHighlight2Label",
    "ctaHighlight3Value", "ctaHighlight3Label",
    "ctaHighlight4Value", "ctaHighlight4Label",
    "sponsorWallEyebrow", "sponsorWallTitle", "sponsorWallSubtitle",
    "sponsorWallEmptyText",
    "registerEyebrow", "registerTitle", "registerSubtitle",
    "footerTaglineLine1", "footerTaglineLine2", "footerBackLabel",
  ];
  for (const key of stringFields) {
    if (typeof input[key] === "string") {
      out[key] = input[key].trim();
    }
  }
  return out;
}
// ─── GET: list all tournaments (admin view) ────────────
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  await dbConnect();
  const list = await Tournament.find().sort({ startTime: 1 }).populate("organizer", "name email").lean();

  return Response.json({
    tournaments: list.map((t) => ({
      ...t,
      _id: t._id.toString(),
      createdAt: t.createdAt?.toISOString(),
      updatedAt: t.updatedAt?.toISOString(),
      startTime: t.startTime?.toISOString(),
    })),
  });
}

// ─── POST: create a tournament ─────────────────────────
export async function POST(req) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();

    // ── Validate required string/number fields ──
    const required = [
      "name",
      "mode",
      "map",
      "prize",
      "slots",
      "date",
      "startTime",
    ];

    for (const key of required) {
      if (
        body[key] === undefined ||
        body[key] === null ||
        body[key] === ""
      ) {
        return Response.json(
          { error: `${key} is required` },
          { status: 400 }
        );
      }
    }

    // ── Validate & parse startTime ──
    const startTime = new Date(body.startTime);
    if (isNaN(startTime.getTime())) {
      return Response.json(
        { error: "Please pick a valid start time" },
        { status: 400 }
      );
    }

    // ── Validate numbers ──
    const prize = Number(body.prize);
    const slots = Number(body.slots);
    const filled = Number(body.filled || 0);

    if (!Number.isFinite(prize) || prize < 0) {
      return Response.json(
        { error: "Prize must be a valid number" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(slots) || slots < 1) {
      return Response.json(
        { error: "Slots must be at least 1" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(filled) || filled < 0) {
      return Response.json(
        { error: "Filled must be a valid number" },
        { status: 400 }
      );
    }

    // ── Create ──
    await dbConnect();

    const t = await Tournament.create({
      name: body.name.trim(),
      mode: body.mode,
      map: body.map,
      entry: 0,                            // always free
      prize,
      slots,
      filled,
      date: body.date.trim(),
      startTime,
      status: body.status || "Open",
      color: body.color || "green",
      roomId: (body.roomId || "").trim(),
      roomPassword: (body.roomPassword || "").trim(),
      sponsors: sanitizeSponsors(body.sponsors),
      pageContent: sanitizePageContent(body.pageContent),
      bannerImage: body.bannerImage || "",
    });

    return Response.json({
      tournament: {
        ...t.toObject(),
        _id: t._id.toString(),
      },
    });
  } catch (err) {
    console.error("Create tournament error:", err);
    return Response.json(
      { error: err.message || "Failed to create" },
      { status: 500 }
    );
  }
}