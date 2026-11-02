// app/tournaments/[id]/page.jsx
import { redirect } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Registration from "@/models/Registration";
import { getAuthUser } from "@/lib/auth";
import TournamentDetailClient from "./TournamentDetailClient";
import "./detail.css";

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({ params }) {
  const { id } = await params;

  let tournament = null;
  let registration = null;
  let isLoggedIn = false;

  try {
    await dbConnect();
    tournament = await Tournament.findById(id)
      .select("-roomId -roomPassword")
      .lean();

    if (tournament) {
      const auth = await getAuthUser();
      isLoggedIn = !!auth;
      if (auth) {
        registration = await Registration.findOne({
          user: auth.userId,
          tournament: id,
        }).lean();
      }
    }
  } catch {
    tournament = null;
  }

  if (!tournament) redirect("/tournaments");

  const t = {
    id: tournament._id.toString(),
    name: tournament.name,
    mode: tournament.mode,
    map: tournament.map,
    prize: tournament.prize,
    slots: tournament.slots,
    filled: tournament.filled,
    date: tournament.date,
    startTime: tournament.startTime?.toISOString() || null,
    status: tournament.status,
    color: tournament.color,
  };

  // ─── Page content (all admin-editable) ───
  const pc = tournament.pageContent || {};

  const BRAND = {
    name: pc.brandName || "ZYXPORT",
    tagline: pc.brandTagline || "WHERE LEGENDS ARE FORGED",
    subTagline:
      pc.brandSubTagline ||
      "The official competitive circuit for BGMI. Every match, a proving ground.",
    website: pc.brandWebsite || "zyxport.com",
  };

  const CTA = {
    eyebrow: pc.ctaEyebrow || "BECOME PART OF THE CIRCUIT",
    titleLine1: pc.ctaTitleLine1 || "MORE THAN A",
    titleLine2: pc.ctaTitleLine2 || "TOURNAMENT PLATFORM.",
    subtitle:
      pc.ctaSubtitle ||
      "ZYXPORT Arena is a full esports ecosystem — weekly tournaments, ranked ladders, creator showcases, and a growing roster of partners who back the next generation of Indian gaming talent.",
    primaryLabel: pc.ctaPrimaryLabel || "JOIN THE CIRCUIT",
    primaryHref: pc.ctaPrimaryHref || "/signup",
    secondaryLabel: pc.ctaSecondaryLabel || "EXPLORE ALL TOURNAMENTS",
    secondaryHref: pc.ctaSecondaryHref || "/tournaments",
    highlights: [
      {
        value: pc.ctaHighlight1Value || "24/7",
        label: pc.ctaHighlight1Label || "Competition",
      },
      {
        value: pc.ctaHighlight2Value || "100%",
        label: pc.ctaHighlight2Label || "Free Entry",
      },
      {
        value: pc.ctaHighlight3Value || "48H",
        label: pc.ctaHighlight3Label || "Prize Payouts",
      },
      {
        value: pc.ctaHighlight4Value || "BGMI",
        label: pc.ctaHighlight4Label || "Battle Ready",
      },
    ],
  };

  const SPONSOR_WALL = {
    eyebrow: pc.sponsorWallEyebrow || "THE CIRCUIT IS POWERED BY",
    title: pc.sponsorWallTitle || "BACKED BY THE BEST.",
    subtitle:
      pc.sponsorWallSubtitle ||
      "ZYXPORT Arena is made possible by partners who believe in the future of Indian mobile esports.",
    emptyText:
      pc.sponsorWallEmptyText ||
      "Sponsor slots are open for this tournament.",
  };

  const REGISTER = {
    eyebrow: pc.registerEyebrow || "YOUR MOMENT STARTS HERE",
    title: pc.registerTitle || "CLAIM YOUR PLACE.",
    subtitle:
      pc.registerSubtitle || "Free to enter. Real prizes. Real competition.",
  };

  const FOOTER = {
    taglineLine1:
      pc.footerTaglineLine1 || "Every match. Every kill. Every victory.",
    taglineLine2: pc.footerTaglineLine2 || "WHERE LEGENDS ARE FORGED",
    backLabel: pc.footerBackLabel || "← Back to all tournaments",
  };

  // ─── Sponsors ───
  const sponsors = Array.isArray(tournament.sponsors)
    ? tournament.sponsors
    : [];
  const titleSponsor = sponsors.find((s) => s.tier === "title" && s.name);
  const goldSponsors = sponsors.filter((s) => s.tier === "gold" && s.name);
  const communitySponsors = sponsors.filter(
    (s) => s.tier === "community" && s.name
  );

  const percentage =
    t.slots > 0 ? Math.min((t.filled / t.slots) * 100, 100) : 0;

  // ─── Split a title so the last word gets highlighted ───
  function splitLastWord(text) {
    const words = (text || "").trim().split(/\s+/);
    if (words.length === 0) return { rest: "", last: "" };
    const last = words[words.length - 1];
    const rest = words.slice(0, -1).join(" ");
    return { rest, last };
  }

  const sponsorWallTitle = splitLastWord(SPONSOR_WALL.title);
  const registerTitle = splitLastWord(REGISTER.title);

  return (
    <main className="brand-page">
      {/* ═══ HERO ═══ */}
      <section className="brand-hero">
        <div className="brand-hero-bg" />
        <div className="brand-hero-glow" />

        <div className="brand-hero-container">
          <header className="brand-topbar">
            <Link href="/" className="brand-mark">
              <span className="brand-mark-symbol">◈</span>
              <div>
                <strong>{BRAND.name}</strong>
                <small>ESPORTS CIRCUIT</small>
              </div>
            </Link>
            {titleSponsor && (
              <a
                href={titleSponsor.href || "#"}
                className="brand-title-sponsor"
              >
                <span className="brand-title-sponsor-label">
                  PRESENTED BY
                </span>
                <span className="brand-title-sponsor-logo">
                  {titleSponsor.logo || "⚡"}
                </span>
                <strong>{titleSponsor.name}</strong>
              </a>
            )}
          </header>

          <div className="brand-hero-main">
            <span className="brand-hero-eyebrow">
              <span className="brand-hero-eyebrow-dot" />
              LIVE CAMPAIGN · {t.status}
            </span>

            <h1 className="brand-hero-title">
              {BRAND.tagline.split(" ").map((word, i, arr) => (
                <span key={i} className="brand-hero-title-word">
                  {i === arr.length - 1 ? <em>{word}</em> : word}{" "}
                </span>
              ))}
            </h1>

            <p className="brand-hero-subtitle">{BRAND.subTagline}</p>

            {/* ─── FEATURED TOURNAMENT CARD ─── */}
            <div className="brand-tournament-card">
              <div className="brand-tournament-header">
                <div>
                  <span className="brand-tournament-label">
                    FEATURED TOURNAMENT
                  </span>
                  <h2>{t.name}</h2>
                  <span className="brand-tournament-meta">
                    {t.map} MAP · {t.mode} · {t.date}
                  </span>
                </div>
                <span
                  className={`brand-tournament-status status-${t.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {t.status}
                </span>
              </div>

              <div className="brand-tournament-stats">
                <div>
                  <small>Prize Pool</small>
                  <strong className="brand-prize">
                    ₹{t.prize.toLocaleString("en-IN")}
                  </strong>
                </div>
                <div>
                  <small>Entry</small>
                  <strong className="brand-free">Free</strong>
                </div>
                <div>
                  <small>Slots</small>
                  <strong>
                    {t.filled}/{t.slots}
                  </strong>
                </div>
              </div>

              <div className="brand-tournament-progress">
                <div
                  className="brand-tournament-progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="brand-tournament-footer">
                <span>
                  {Math.max(0, t.slots - t.filled)} slots remaining
                </span>
                <a href="#register" className="brand-cta">
                  REGISTER NOW <span>→</span>
                </a>
              </div>
            </div>

            <div className="brand-hero-scroll">
              <span>SCROLL TO EXPLORE</span>
              <span className="brand-scroll-line" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BRAND CTA ═══ */}
      <section className="brand-cta-section">
        <div className="brand-cta-bg" />
        <div className="brand-cta-container">
          <span className="brand-cta-eyebrow">
            <span className="brand-cta-eyebrow-line" />
            {CTA.eyebrow}
          </span>

          <h2 className="brand-cta-title">
            {CTA.titleLine1}
            <br />
            <em>{CTA.titleLine2}</em>
          </h2>

          <p className="brand-cta-subtitle">{CTA.subtitle}</p>

          <div className="brand-cta-actions">
            <Link href={CTA.primaryHref} className="brand-cta-primary">
              {CTA.primaryLabel} <span>→</span>
            </Link>
            <Link href={CTA.secondaryHref} className="brand-cta-secondary">
              {CTA.secondaryLabel}
            </Link>
          </div>

          <div className="brand-cta-highlights">
            {CTA.highlights.map((h, i) => (
              <div key={i} className="brand-cta-highlight">
                <strong>{h.value}</strong>
                <span>{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SPONSOR WALL ═══ */}
      <section className="brand-sponsors">
        <div className="brand-sponsors-container">
          <div className="brand-sponsors-heading">
            <span className="brand-sponsors-eyebrow">
              {SPONSOR_WALL.eyebrow}
            </span>
            <h2>
              {sponsorWallTitle.rest}{" "}
              {sponsorWallTitle.last && (
                <em>{sponsorWallTitle.last}</em>
              )}
            </h2>
            <p>{SPONSOR_WALL.subtitle}</p>
          </div>

          {sponsors.length === 0 && (
            <p
              style={{
                color: "var(--muted)",
                textAlign: "center",
                padding: "40px 20px",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              {SPONSOR_WALL.emptyText}
            </p>
          )}

          {goldSponsors.length > 0 && (
            <div className="brand-sponsor-tier">
              <span className="brand-sponsor-tier-label">
                GOLD PARTNERS
              </span>
              <div className="brand-sponsor-grid gold">
                {goldSponsors.map((s, i) => (
                  <a
                    key={`${s.name}-${i}`}
                    href={s.href || "#"}
                    className="brand-sponsor-card"
                  >
                    <span className="brand-sponsor-logo">
                      {s.logo || "🎯"}
                    </span>
                    <div>
                      <strong>{s.name}</strong>
                      {s.tagline && <small>{s.tagline}</small>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {communitySponsors.length > 0 && (
            <div className="brand-sponsor-tier">
              <span className="brand-sponsor-tier-label">
                COMMUNITY PARTNERS
              </span>
              <div className="brand-sponsor-grid community">
                {communitySponsors.map((s, i) => (
                  <a
                    key={`${s.name}-${i}`}
                    href={s.href || "#"}
                    className="brand-sponsor-card small"
                  >
                    <span className="brand-sponsor-logo">
                      {s.logo || "🎯"}
                    </span>
                    <strong>{s.name}</strong>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ REGISTER ═══ */}
      <section className="brand-register-section" id="register">
        <div className="brand-register-container">
          <div className="brand-register-header">
            <span className="brand-sponsors-eyebrow">
              {REGISTER.eyebrow}
            </span>
            <h2>
              {registerTitle.rest}{" "}
              {registerTitle.last && <em>{registerTitle.last}</em>}
            </h2>
            <p>{REGISTER.subtitle}</p>
          </div>

          <TournamentDetailClient
            tournament={t}
            isLoggedIn={isLoggedIn}
            isRegistered={registration?.paymentStatus === "paid"}
            registrationId={registration?._id?.toString() || null}
          />
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <section className="brand-footer">
        <div className="brand-footer-container">
          <div className="brand-footer-mark">
            <span className="brand-mark-symbol">◈</span>
            <div>
              <strong>{BRAND.name}</strong>
              <small>{BRAND.website}</small>
            </div>
          </div>
          <p className="brand-footer-tagline">
            {FOOTER.taglineLine1}
            <br />
            <em>{FOOTER.taglineLine2}</em>
          </p>
          <Link href="/tournaments" className="brand-footer-back">
            {FOOTER.backLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}