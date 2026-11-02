import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import User from "@/models/User";
import Winner from "@/models/Winner";
import "./about.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "About — Zyxport Esports",
  description:
    "Zyxport is a competitive BGMI tournament platform built for players who want to prove their skill and win real prizes.",
};

const values = [
  {
    icon: "🎯",
    title: "Skill First",
    description:
      "Every tournament is designed around pure competition. No gimmicks, no pay-to-win — just you, your squad, and the drop.",
  },
  {
    icon: "⚡",
    title: "Fast & Fair",
    description:
      "Instant room access after payment, transparent prize pools, and payouts processed within 48 hours of results.",
  },
  {
    icon: "🔒",
    title: "Secure by Design",
    description:
      "Payments through Razorpay, room credentials locked behind payment, and your data never sold or shared.",
  },
  {
    icon: "🏆",
    title: "Real Rewards",
    description:
      "Prize money goes straight to your bank or UPI. No wallet credits, no hidden conditions — real cash, real fast.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up in seconds. Add your IGN and BGMI UID so we can verify you're the real player.",
  },
  {
    number: "02",
    title: "Pick Your Battle",
    description:
      "Browse upcoming tournaments by mode, map, entry fee, and prize pool. Register for the ones that match your skill.",
  },
  {
    number: "03",
    title: "Pay & Get Room Access",
    description:
      "Secure checkout through Razorpay. Room ID and password unlock instantly after payment.",
  },
  {
    number: "04",
    title: "Compete & Get Paid",
    description:
      "Play the match. If you win, admin marks your victory and sends the prize to your bank within 48 hours.",
  },
];

export default async function AboutPage() {
  // ─── Live stats from DB ───
  let stats = {
    tournaments: 0,
    players: 0,
    totalPrize: 0,
    winners: 0,
  };

  try {
    await dbConnect();

    const [tournamentCount, playerCount, winners] = await Promise.all([
      Tournament.countDocuments({ status: { $nin: ["Cancelled"] } }),
      User.countDocuments(),
      Winner.find().select("prizeAmount paidToBank").lean(),
    ]);

    stats = {
      tournaments: tournamentCount,
      players: playerCount,
      winners: winners.length,
      totalPrize: winners
        .filter((w) => w.paidToBank)
        .reduce((sum, w) => sum + (w.prizeAmount || 0), 0),
    };
  } catch (err) {
    console.error("About page stats error:", err);
  }

  return (
    <main className="about-page">
      {/* ─── HERO ─── */}
      <section className="about-hero">
        <div className="about-hero-bg" />
        <div className="about-container">
          <span className="eyebrow">THE STORY BEHIND THE ARENA</span>
          <h1>
            BUILT FOR PLAYERS WHO
            <br />
            <span>REFUSE TO STAY AVERAGE.</span>
          </h1>
          <p>
            Zyxport is a competitive BGMI tournament platform created by
            players, for players. We believe skill should pay — literally.
            No filler, no fluff, no pay-to-win. Just competitive matches
            with real prize money and clean payouts.
          </p>

          <div className="about-hero-actions">
            <Link href="/tournaments" className="primary-button">
              Browse Tournaments <span>→</span>
            </Link>
            <Link href="/signup" className="secondary-button">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LIVE STATS ─── */}
      <section className="about-stats-section">
        <div className="about-container">
          <div className="about-stats-grid">
            <div className="about-stat-card">
              <strong>{stats.tournaments}</strong>
              <small>Tournaments Hosted</small>
            </div>
            <div className="about-stat-card">
              <strong>{stats.players}</strong>
              <small>Registered Players</small>
            </div>
            <div className="about-stat-card">
              <strong>{stats.winners}</strong>
              <small>Winners Crowned</small>
            </div>
            <div className="about-stat-card highlight">
              <strong>
                ₹{stats.totalPrize.toLocaleString("en-IN")}
              </strong>
              <small>Prize Money Paid Out</small>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSION ─── */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-two-col">
            <div>
              <span className="eyebrow">OUR MISSION</span>
              <h2>
                MAKE BGMI<br />
                <span>WORTH PLAYING.</span>
              </h2>
            </div>

            <div className="about-mission-text">
              <p>
                Competitive BGMI has a problem: most tournaments are either
                riddled with cheaters, pay out in useless wallet coins, or
                ask for a month-long verification process just to withdraw
                your winnings.
              </p>
              <p>
                We built Zyxport to fix that. Every tournament runs on
                verified entry, every prize is tracked, and every payout
                goes to your <strong>actual bank account</strong> — not
                some locked-in platform currency.
              </p>
              <p>
                Our long-term goal is simple: become the most trusted
                tournament platform for Indian mobile esports. No drama,
                no gimmicks. Just clean, competitive, pay-to-win-free
                esports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="about-section about-values-section">
        <div className="about-container">
          <div className="about-center-heading">
            <span className="eyebrow">WHAT WE STAND FOR</span>
            <h2>
              OUR <span>CORE VALUES</span>
            </h2>
            <p>
              The principles that shape every tournament, every payout, and
              every decision we make.
            </p>
          </div>

          <div className="about-values-grid">
            {values.map((v) => (
              <div key={v.title} className="about-value-card">
                <span className="about-value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="about-section about-how-section">
        <div className="about-container">
          <div className="about-center-heading">
            <span className="eyebrow">THE PLAYER JOURNEY</span>
            <h2>
              FOUR STEPS FROM SIGNUP<br />
              <span>TO PRIZE MONEY.</span>
            </h2>
          </div>

          <div className="about-steps-list">
            {steps.map((step, idx) => (
              <div key={step.number} className="about-step-card">
                <div className="about-step-number">{step.number}</div>
                <div className="about-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                {idx < steps.length - 1 && (
                  <span className="about-step-connector">↓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST / PAYOUTS ─── */}
      <section className="about-section about-payout-section">
        <div className="about-container">
          <div className="about-payout-card">
            <div className="about-payout-content">
              <span className="eyebrow">REAL PAYOUTS, REAL FAST</span>
              <h2>
                WIN MONEY GOES TO<br />
                <span>YOUR BANK, NOT A WALLET.</span>
              </h2>
              <p>
                When you win, your prize amount is tracked in your profile
                instantly. Our admin team manually verifies and transfers
                the money to your bank or UPI within 48 hours. You'll see
                the payout marked "Paid" on your profile the moment it's
                done — with a transaction reference for full transparency.
              </p>

              <ul className="about-payout-points">
                <li>
                  <span>✓</span> Bank transfer or UPI — your choice
                </li>
                <li>
                  <span>✓</span> Payout within 48 hours of results
                </li>
                <li>
                  <span>✓</span> Transaction reference on every payout
                </li>
                <li>
                  <span>✓</span> Zero withdrawal fees
                </li>
              </ul>
            </div>

            <div className="about-payout-visual">
              <div className="about-payout-receipt">
                <div className="receipt-header">
                  <span>PAYOUT RECEIPT</span>
                  <span className="receipt-status">✓ PAID</span>
                </div>
                <div className="receipt-amount">
                  <small>Prize Amount</small>
                  <strong>₹2,000</strong>
                </div>
                <div className="receipt-row">
                  <span>Tournament</span>
                  <strong>Erangel Showdown</strong>
                </div>
                <div className="receipt-row">
                  <span>Rank</span>
                  <strong>#1</strong>
                </div>
                <div className="receipt-row">
                  <span>Method</span>
                  <strong>UPI</strong>
                </div>
                <div className="receipt-row">
                  <span>Reference</span>
                  <strong className="receipt-mono">UTR4839201</strong>
                </div>
                <div className="receipt-footer">
                  Sent to your bank in under 24 hours.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="about-cta-section">
        <div className="about-container">
          <span className="eyebrow">YOUR BATTLE AWAITS</span>
          <h2>
            READY TO <span>GET PAID</span><br />
            FOR PLAYING?
          </h2>
          <p>
            Join hundreds of BGMI players competing for real prize money
            every week.
          </p>
          <div className="about-cta-actions">
            <Link href="/signup" className="primary-button">
              Create Your Account <span>→</span>
            </Link>
            <Link href="/tournaments" className="secondary-button">
              See Upcoming Matches
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}