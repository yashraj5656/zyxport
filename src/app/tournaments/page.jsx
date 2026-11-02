// app/tournaments/page.jsx
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tournaments — Zyxport" };

async function getTournaments() {
  try {
    await dbConnect();
    const docs = await Tournament.find({
      status: { $nin: ["Cancelled"] },
    })
      .sort({ startTime: 1 })
      .select("-roomId -roomPassword")
      .lean();

    return docs.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      mode: t.mode,
      map: t.map,
      prize: t.prize,
      slots: t.slots,
      filled: t.filled,
      date: t.date,
      status: t.status,
      color: t.color,
    }));
  } catch (err) {
    console.error("Tournaments fetch error:", err);
    return [];
  }
}

export default async function TournamentsPage() {
  const tournaments = await getTournaments();

  return (
    <main className="section" style={{ minHeight: "70vh" }}>
      <div className="section-container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ALL BATTLES</span>
            <h2>
              TOURNAMENTS{" "}
              <span>
                {tournaments.length > 0 && `(${tournaments.length})`}
              </span>
            </h2>
            <p>Every upcoming BGMI match in one place — free to enter.</p>
          </div>
          <Link href="/" className="view-all">
            ← Back home
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <p
            style={{
              color: "var(--muted)",
              textAlign: "center",
              padding: 60,
            }}
          >
            No tournaments scheduled yet.
          </p>
        ) : (
          <div className="tournament-grid">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Reuse the same card as home
function TournamentCard({ tournament }) {
  const percentage =
    tournament.slots > 0
      ? (tournament.filled / tournament.slots) * 100
      : 0;

  return (
    <article className="tournament-card">
      <div className={`tournament-banner ${tournament.color}`}>
        <div className="banner-top">
          <span className="game-tag">BGMI</span>
          <span className="status-tag">{tournament.status}</span>
        </div>
        <div className="banner-content">
          <span className="map-label">{tournament.map} MAP</span>
          <h3>{tournament.name}</h3>
          <p>{tournament.mode}</p>
        </div>
        <div className="banner-decoration">⚔</div>
      </div>

      <div className="tournament-details">
        <div className="prize-entry">
          <div>
            <span className="detail-label">Prize Pool</span>
            <strong className="prize-value">
              ₹{tournament.prize.toLocaleString("en-IN")}
            </strong>
          </div>
          <div className="entry-price">
            <span className="detail-label">Entry</span>
            <strong className="free-entry">Free</strong>
          </div>
        </div>

        <div className="tournament-date">
          <span>◷ {tournament.date}</span>
          <span>
            👥 {Math.max(0, tournament.slots - tournament.filled)} slots left
          </span>
        </div>

        <div className="slots-info">
          <div className="slots-text">
            <span>Registered Players</span>
            <strong>
              {tournament.filled}/{tournament.slots}
            </strong>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <Link
          href={`/tournaments/${tournament.id}`}
          className="join-button"
        >
          View Tournament <span>→</span>
        </Link>
      </div>
    </article>
  );
}