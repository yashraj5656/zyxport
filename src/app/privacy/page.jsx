import Link from "next/link";
import "../legal.css";

export const metadata = {
  title: "Privacy Policy — Zyxport Esports",
  description:
    "How Zyxport collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "November 2, 2026";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <span className="eyebrow">LEGAL</span>
          <h1>
            PRIVACY<br />
            <span>POLICY</span>
          </h1>
          <p className="legal-updated">
            Last updated: <strong>{LAST_UPDATED}</strong>
          </p>
        </header>

        <article className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Zyxport ("we", "our", "us") respects your privacy. This policy
              explains what data we collect, why we collect it, and how we
              protect it when you use our BGMI tournament platform.
            </p>
            <p>
              By using Zyxport, you consent to the practices described in this
              policy.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <h3>Information you give us</h3>
            <ul>
              <li>
                <strong>Account details</strong> — name, email address, and a
                securely hashed password.
              </li>
              <li>
                <strong>Profile info</strong> — in-game name (IGN), BGMI UID,
                avatar (optional emoji), bio (optional).
              </li>
              <li>
                <strong>Payout info</strong> — your bank account details or
                UPI ID, provided by you to receive prize money. This is only
                collected when you win a tournament and request a payout.
              </li>
              <li>
                <strong>Communications</strong> — messages sent through our
                contact form.
              </li>
            </ul>

            <h3>Information collected automatically</h3>
            <ul>
              <li>
                <strong>Cookies</strong> — a single httpOnly cookie containing
                a login token. No tracking or advertising cookies.
              </li>
              <li>
                <strong>Basic usage logs</strong> — IP address, browser type,
                and page request timestamps for security and debugging.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use your data to:</p>
            <ul>
              <li>Create and secure your account.</li>
              <li>
                Register you for tournaments and verify your identity in match.
              </li>
              <li>
                Deliver room ID and password to registered players only.
              </li>
              <li>
                Process prize payouts to your bank or UPI account.
              </li>
              <li>Respond to support requests and contact messages.</li>
              <li>Detect fraud, cheating, and abuse of the platform.</li>
              <li>Improve the platform experience.</li>
            </ul>
            <p>
              We <strong>do not</strong> sell your data to third parties, and
              we do not use it for advertising.
            </p>
          </section>

          <section>
            <h2>4. Tournament Entry</h2>
            <p>
              All tournaments on Zyxport are <strong>free to enter</strong>.
              We do not collect any payment information to register for a
              tournament — you only need to provide your in-game name (IGN)
              and BGMI UID.
            </p>
            <p>
              There are no entry fees, no hidden charges, and no card or UPI
              details required to compete. Your bank or UPI details are only
              needed if you win a prize and want us to send you the payout.
            </p>
          </section>

          <section>
            <h2>5. Data Sharing</h2>
            <p>We share your data only in these limited cases:</p>
            <ul>
              <li>
                <strong>With tournament organizers</strong> — only your IGN
                and UID, so they can verify you in-game. Your email and bank
                details are never shared with organizers.
              </li>
              <li>
                <strong>With payment services</strong> — when sending prize
                money to your bank or UPI, we use secure banking channels.
                Your details are not shared with any third-party advertising
                or analytics services.
              </li>
              <li>
                <strong>With law enforcement</strong> — if required by a valid
                legal request under Indian law.
              </li>
            </ul>
          </section>

          <section>
            <h2>6. Data Security</h2>
            <p>
              We take security seriously. Passwords are hashed with{" "}
              <strong>bcrypt</strong> (12 rounds) and never stored in plain
              text. Your login session uses a signed JWT stored in an
              httpOnly cookie that cannot be read by JavaScript.
            </p>
            <p>
              Bank and UPI details you provide for payouts are stored
              encrypted at rest and are only accessed by authorized
              personnel when processing a winner's prize money.
            </p>
            <p>
              While we take reasonable precautions, no system is 100% secure.
              If you suspect unauthorized access, contact us immediately.
            </p>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <p>
              We keep your account data for as long as your account is
              active. When you delete your account, we remove your personal
              information within 30 days, except:
            </p>
            <ul>
              <li>
                Payout records, which we retain for 7 years for tax and
                accounting compliance.
              </li>
              <li>
                Match history and winner records, which remain visible on the
                public leaderboard.
              </li>
            </ul>
          </section>

          <section>
            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>
                <strong>Access</strong> the personal data we hold about you.
              </li>
              <li>
                <strong>Correct</strong> any inaccurate information in your
                profile.
              </li>
              <li>
                <strong>Delete</strong> your account and associated data.
              </li>
              <li>
                <strong>Export</strong> your data in a readable format.
              </li>
              <li>
                <strong>Withdraw consent</strong> for non-essential data
                processing.
              </li>
            </ul>
            <p>
              To exercise any of these rights, email{" "}
              <a href="mailto:zqentra@gmail.com">zqentra@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2>9. Cookies</h2>
            <p>
              Zyxport uses a single essential cookie: a login token that
              keeps you signed in. This cookie is httpOnly, which means
              JavaScript cannot access it, protecting it against XSS attacks.
            </p>
            <p>
              We do not use advertising, tracking, or analytics cookies. If
              you clear your browser cookies, you will be logged out of your
              account.
            </p>
          </section>

          <section>
            <h2>10. Children's Privacy</h2>
            <p>
              Zyxport is intended for users aged 13 and above. We do not
              knowingly collect data from children under 13. If we become
              aware that a child under 13 has provided us with personal
              information, we will delete it.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this policy as the platform evolves. When we make
              significant changes, we'll notify users via email or a banner
              on the site. Continued use after changes means you accept the
              updated policy.
            </p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>
              Questions about this privacy policy? Email us at{" "}
              <a href="mailto:zqentra@gmail.com">zqentra@gmail.com</a> or
              through our <Link href="/contact">Contact page</Link>.
            </p>
          </section>
        </article>

        <footer className="legal-footer">
          <Link href="/terms" className="legal-footer-link">
            Read our Terms & Conditions →
          </Link>
        </footer>
      </div>
    </main>
  );
}