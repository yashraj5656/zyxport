// app/organizers/page.jsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/getCurrentUser";
import SubscribeButton from "./SubscribeButton"; // We'll create this next
import "./organizers.css";

export const metadata = {
  title: "Host Your Tournament — ZYXPORT",
  description: "Partner with Zyxport to host your next BGMI tournament. Introductory pricing available.",
};

export default async function OrganizersPage() {
  const user = await getCurrentUser();

  return (
    <main className="org-page">
      {/* HERO */}
      <section className="org-hero">
        <div className="org-hero-bg" />
        <div className="section-container" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow">BECOME A PARTNER</span>
          <h1>
            HOST YOUR NEXT<br />
            <span>TOURNAMENT ON ZYXPORT.</span>
          </h1>
          <p>
            Whether you run a massive esports organization or a tight-knit community, 
            use our infrastructure to host fair, competitive BGMI matches. We handle the 
            room IDs, the player management, and the payouts — so you can focus on the game.
          </p>
        </div>
      </section>

      {/* PRICING & CHECKOUT */}
      <section className="section org-pricing-section" id="pricing">
        <div className="section-container">
          <div className="center-heading">
            <span className="eyebrow">ONE PLAN. UNLIMITED POWER.</span>
            <h2>THE ORGANIZER <span>MEMBERSHIP.</span></h2>
            <p>Get unlimited access to the ZYXPORT tournament engine.</p>
          </div>

          <div className="org-pricing-grid" style={{ gridTemplateColumns: "1fr", maxWidth: "500px" }}>
            <div className="org-price-card popular">
              <div className="org-popular-badge">BEST VALUE</div>
              <div className="org-price-header">
                <h3>Monthly Access</h3>
                <p>For organizers running regular events.</p>
              </div>
              <div className="org-price-amount">
                <strong>₹799</strong>
                <span>/ month</span>
              </div>
              <ul className="org-price-features">
                <li> <strong>Unlimited</strong> tournaments per month</li>
                <li> Secure room ID distribution</li>
                <li> Up to 100 player slots per match</li>
                <li> Custom sponsor branding</li>
                <li> Priority support </li>
              </ul>

              {/* 👇 The dynamic checkout button */}
              <div style={{ marginTop: "auto" }}>
                {user ? (
                  <SubscribeButton />
                ) : (
                  <Link href="/signup" className="primary-button" style={{ width: "100%" }}>
                    Create Account to Subscribe
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}