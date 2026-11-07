// app/page.jsx
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import { guides } from "@/lib/guidesData";
import GuideCard from "@/components/GuideCard";
import { getCurrentUser } from "@/lib/getCurrentUser";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: "🎮",
    title: "Choose Your Match",
    description:
      "Explore upcoming BGMI tournaments and select the competition that suits your playstyle.",
  },
  {
    icon: "✍️",
    title: "Register Free",
    description:
      "Sign up for any tournament with your IGN and UID — no entry fee, no hidden charges.",
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
      prize: t.prize,
      slots: t.slots,
      filled: t.filled,
      date: t.date,
      status: t.status,
      color: t.color,
      bannerImage: t.bannerImage || "",
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
      <div 
        className={`tournament-banner ${tournament.color}`}
        style={
          tournament.bannerImage 
            ? { 
                backgroundImage: `url(${tournament.bannerImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative"
              } 
            : {}
        }
      >
        {/* Dark overlay so text is readable on images */}
        {tournament.bannerImage && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)",
            zIndex: 1
          }} />
        )}

        <div className="banner-top" style={{ position: "relative", zIndex: 2 }}>
          <span className="game-tag">BGMI</span>
          <span className="status-tag">{tournament.status}</span>
        </div>

        <div className="banner-content" style={{ position: "relative", zIndex: 2 }}>
          <span className="map-label">{tournament.map} MAP</span>
          <h3>{tournament.name}</h3>
          <p>{tournament.mode}</p>
        </div>

        {/* Only show the decorative swords if there is NO image */}
        {!tournament.bannerImage && (
          <div className="banner-decoration">⚔</div>
        )}
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

export default async function Home() {
  const tournaments = await getUpcomingTournaments();
  const user = await getCurrentUser();

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
              Your skills deserve a bigger battlefield. Join free BGMI
              tournaments, challenge the best players and compete for real
              prizes — no entry fee, ever.
            </p>

            <div className="hero-actions">
              <Link href="#tournaments" className="primary-button">
                Explore Tournaments <span>→</span>
              </Link>

              <Link href="#organizers" className="secondary-button">
                Host tournament
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <strong>24/7</strong>
                <span>Competition</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Free Entry</span>
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
              <span>🎟️</span>
              <div>
                <strong>Free</strong>
                <small>Entry Fee</small>
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
                Pick your match, register free and get ready to dominate.
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

      {/* BECOME AN ORGANIZER SECTION */}
      <section className="section org-promo-section" id="organizers">
        <div className="section-container">
          <div className="org-promo-card">
            <div className="org-promo-content">
              {user?.isOrganizer ? (
                /* 👇 UI FOR EXISTING ORGANIZERS */
                <>
                  <span className="eyebrow" style={{ color: "var(--green)" }}>
                    WELCOME BACK, ORGANIZER
                  </span>
                  <h2>
                    READY TO HOST YOUR NEXT <span>TOURNAMENT?</span>
                  </h2>
                  <p>
                    Your organizer dashboard is ready. Create unlimited tournaments, distribute secure room IDs, and manage player registrations effortlessly.
                  </p>
                  
                  <div className="org-promo-features">
                    <div><span>✓</span> Dashboard Active</div>
                    <div><span>✓</span> Unlimited Events</div>
                  </div>

                  <div className="org-promo-actions">
                    <Link href="/organizer" className="primary-button">
                      Go to Dashboard <span>→</span>
                    </Link>
                  </div>
                </>
              ) : (
                /* 👇 UI FOR NON-ORGANIZERS (DEFAULT) */
                <>
                  <span className="eyebrow">FOR TOURNAMENT ORGANIZERS</span>
                  <h2>
                    WANT TO HOST YOUR OWN <span>TOURNAMENT?</span>
                  </h2>
                  <p>
                    Skip the spreadsheets and manual room IDs. Use ZYXPORT&apos;s infrastructure to host fair, competitive BGMI matches. Get unlimited tournaments, secure room delivery, and player management for just <strong>₹799/month</strong>.
                  </p>
                  
                  <div className="org-promo-features">
                    <div><span>✓</span> Unlimited Tournaments</div>
                    <div><span>✓</span> Secure Room IDs</div>
                    <div><span>✓</span> Manage player registrations</div>
                  </div>

                  <div className="org-promo-actions">
                    <Link href="/organizers" className="primary-button">
                      Become an Organizer <span>→</span>
                    </Link>
                    <span className="org-promo-price">Starting at ₹799/mo</span>
                  </div>
                </>
              )}
            </div>

            <div className="org-promo-visual">
              <div className="org-visual-card">
                <div className="org-visual-header">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <div className="org-visual-body">
                  <div className="org-visual-icon">🎮</div>
                  <h3>Organizer Dashboard</h3>
                  <div className="org-visual-bar"><div className="org-visual-fill"></div></div>
                  <p>Room ID: 8123 4567</p>
                  <p>Password: zyx123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GUIDES & NEWS */}
      <section className="section how-section" id="guides">
        <div className="section-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LEVEL UP</span>
              <h2>
                LATEST <span>GUIDES</span>
              </h2>
              <p>
                Master your skills, read the rules, and stay updated with the community.
              </p>
            </div>
            <Link href="/guides" className="view-all">
              View All Guides →
            </Link>
          </div>

          <div className="guides-grid home-grid">
            {guides.slice(0, 4).map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-section" id="how-it-works">
        <div className="section-container">
          <div className="center-heading">
            <span className="eyebrow">SIMPLE. FAST. FREE.</span>
            <h2>
              FOUR STEPS TO <span>THE BATTLE</span>
            </h2>
            <p>
              Getting into your next BGMI tournament is easier than ever —
              and completely free.
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
            Stop watching others win. Get into the battlefield for free and
            make your own name.
          </p>
          <Link href="/signup" className="primary-button">
            Create Your Account →
          </Link>
        </div>
      </section>
    </main>
  );
}