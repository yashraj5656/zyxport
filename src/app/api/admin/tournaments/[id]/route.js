// app/api/admin/tournaments/[id]/route.js
import { requireAdmin } from "@/lib/requireAdmin";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

export const dynamic = "force-dynamic";

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


export async function PATCH(req, { params }) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const updates = {};

    // ── String fields ──
    for (const key of [
      "name",
      "mode",
      "map",
      "date",
      "status",
      "color",
      "roomId",
      "roomPassword",
      "bannerImage",
    ]) {
      if (typeof body[key] === "string") {
        updates[key] = body[key].trim();
      }
    }
    
    if (body.pageContent && typeof body.pageContent === "object") {
      const sanitizePageContent = (input) => {
        const out = {};
        const fields = [
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
        for (const key of fields) {
          if (typeof input[key] === "string") out[key] = input[key].trim();
        }
        return out;
      };
    
      updates.pageContent = {
        ...(updates.pageContent || {}),
        ...sanitizePageContent(body.pageContent),
      };
    }

    // ── Numeric fields ──
    for (const key of ["prize", "slots", "filled"]) {
      if (body[key] !== undefined) {
        const num = Number(body[key]);
        if (!Number.isFinite(num) || num < 0) {
          return Response.json(
            { error: `Invalid ${key}` },
            { status: 400 }
          );
        }
        updates[key] = num;
      }
    }

    // ── Date field ──
    if (body.startTime) {
      const start = new Date(body.startTime);
      if (isNaN(start.getTime())) {
        return Response.json(
          { error: "Please pick a valid start time" },
          { status: 400 }
        );
      }
      updates.startTime = start;
    }

    // ── Sponsors ──
    if (Array.isArray(body.sponsors)) {
      updates.sponsors = sanitizeSponsors(body.sponsors);
    }

    await dbConnect();
    const t = await Tournament.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!t) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({
      tournament: {
        ...t.toObject(),
        _id: t._id.toString(),
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    return Response.json(
      { error: err.message || "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const guard = await requireAdmin();
  if (guard.error) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  await dbConnect();
  const deleted = await Tournament.findByIdAndDelete(id);

  if (!deleted) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}