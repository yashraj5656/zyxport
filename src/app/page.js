import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: "🎮",
    title: "Choose Your Match",
    description:
      "Explore upcoming BGMI tournaments and select the competition that suits your playstyle.",
  },
  {
    icon: "💳",
    title: "Secure Your Slot",
    description:
      "Pay the tournament entry fee and confirm your participation.",
  },
  {
    icon: "🔑",
    title: "Get Room Details",
    description:
      "Receive your BGMI room ID and password through your registered account.",
  },
  {
    icon: "🏆",
    title: "Compete & Win",
    description:
      "Join the match, showcase your skills and compete for exciting prizes.",
  },
];

async function getUpcomingTournaments() {
  try {
    await dbConnect();
    const docs = await Tournament.find({
      status: { $nin: ["Completed", "Cancelled"] },
    })
      .sort({ startTime: 1 })
      .limit(3)
      .select("-roomId -roomPassword")
      .lean();

    return docs.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      mode: t.mode,
      map: t.map,
      entry: t.entry,
      prize: t.prize,
      slots: t.slots,
      filled: t.filled,
      date: t.date,
      status: t.status,
      color: t.color,
    }));
  } catch (err) {
    console.error("Home tournaments fetch error:", err);
    return [];
  }
}

function TournamentCard({ tournament }) {
  const percentage = (tournament.filled / tournament.slots) * 100;

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
            <span className="detail-label">Entry Fee</span>
            <strong>₹{tournament.entry}</strong>
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

export default async function Home() {
  const tournaments = await getUpcomingTournaments();

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-background" />

        <div className="hero-container">
          <div className="hero-content">
            <div className="live-indicator">
              <span /> THE BATTLE STARTS HERE
            </div>

            <h1>
              PLAY TO WIN.
              <br />
              <span>RISE TO THE TOP.</span>
            </h1>

            <p>
              Your skills deserve a bigger battlefield. Join competitive
              BGMI tournaments, challenge the best players and compete for
              real prizes.
            </p>

            <div className="hero-actions">
              <Link href="#tournaments" className="primary-button">
                Explore Tournaments <span>→</span>
              </Link>

              <Link href="#how-it-works" className="secondary-button">
                How It Works
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <strong>24/7</strong>
                <span>Competition</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Skill Based</span>
              </div>
              <div>
                <strong>BGMI</strong>
                <span>Battle Ready</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow" />
            <div className="hero-game-card">
              <div className="game-card-top">
                <span>ZYXPORT ORIGINAL</span>
                <span className="online-dot">● LIVE</span>
              </div>

              <div className="game-symbol">⚔</div>

              <div className="game-card-bottom">
                <span>ENTER THE BATTLE</span>
                <strong>CHAMPIONS ARE MADE HERE.</strong>
              </div>
            </div>

            <div className="floating-card floating-one">
              <span>🏆</span>
              <div>
                <strong>₹2,000</strong>
                <small>Prize Pool</small>
              </div>
            </div>

            <div className="floating-card floating-two">
              <span>🔥</span>
              <div>
                <strong>76 / 100</strong>
                <small>Players Joined</small>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-bottom">
          <span>BUILT FOR COMPETITORS</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </section>

      {/* TOURNAMENTS */}
      <section className="section tournaments-section" id="tournaments">
        <div className="section-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR BATTLE</span>
              <h2>
                UPCOMING <span>TOURNAMENTS</span>
              </h2>
              <p>
                Pick your match, secure your slot and get ready to dominate.
              </p>
            </div>

            <Link href="/tournaments" className="view-all">
              View All Tournaments →
            </Link>
          </div>

          {tournaments.length === 0 ? (
            <p
              style={{
                color: "var(--muted)",
                textAlign: "center",
                padding: "60px 20px",
                fontSize: 14,
              }}
            >
              No tournaments scheduled yet. Check back soon.
            </p>
          ) : (
            <div className="tournament-grid">
              {tournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-section" id="how-it-works">
        <div className="section-container">
          <div className="center-heading">
            <span className="eyebrow">SIMPLE. FAST. COMPETITIVE.</span>
            <h2>
              FOUR STEPS TO <span>THE BATTLE</span>
            </h2>
            <p>
              Getting into your next BGMI tournament is easier than ever.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-number">0{index + 1}</div>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="about">
        <div className="cta-container">
          <span className="eyebrow">YOUR NEXT WIN STARTS HERE</span>
          <h2>
            READY TO PROVE
            <br />
            <span>YOUR SKILLS?</span>
          </h2>
          <p>
            Stop watching others win. Get into the battlefield and make your
            own name.
          </p>
          <Link href="/signup" className="primary-button">
            Create Your Account →
          </Link>
        </div>
      </section>
    </main>
  );
}