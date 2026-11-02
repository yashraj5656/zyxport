import Link from "next/link";
import "../legal.css";

export const metadata = {
  title: "Terms & Conditions — Zyxport Esports",
  description: "The terms and conditions for using Zyxport's tournament platform.",
};

const LAST_UPDATED = "November 2, 2026";

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <span className="eyebrow">LEGAL</span>
          <h1>
            TERMS &<br />
            <span>CONDITIONS</span>
          </h1>
          <p className="legal-updated">
            Last updated: <strong>{LAST_UPDATED}</strong>
          </p>
        </header>

        <article className="legal-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account on Zyxport or participating in any
              tournament hosted on our platform, you agree to be bound by
              these Terms & Conditions. If you do not agree to these terms,
              please do not use the platform.
            </p>
            <p>
              We may update these terms from time to time. Continued use of
              the platform after changes means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2>2. Eligibility</h2>
            <p>To use Zyxport, you must:</p>
            <ul>
              <li>Be at least 13 years of age.</li>
              <li>
                Be a legal resident of India (or regions where we operate).
              </li>
              <li>
                Own a valid BGMI account that complies with Krafton's Terms
                of Service.
              </li>
              <li>
                Provide accurate registration information, including a valid
                in-game name (IGN) and BGMI UID.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Account Responsibility</h2>
            <p>
              You are responsible for keeping your login credentials secure.
              Any activity carried out through your account is considered
              your responsibility. If you suspect unauthorized access,
              contact us immediately at{" "}
              <a href="mailto:zqentra@gmail.com">support@zyxport.com</a>.
            </p>
            <p>
              One account per person. Creating multiple accounts to gain an
              unfair advantage (for example, entering a tournament twice) may
              result in a permanent ban.
            </p>
          </section>

          <section>
            <h2>4. Tournament Entry & Payment</h2>
            <p>
              Tournament entry fees are paid through Razorpay and are
              non-refundable once a slot is confirmed, except in the
              following cases:
            </p>
            <ul>
              <li>The tournament is cancelled by the organizer.</li>
              <li>
                The tournament is postponed by more than 7 days without notice.
              </li>
              <li>
                A verified technical failure on our platform prevents you
                from participating.
              </li>
            </ul>
            <p>
              Refunds, if approved, are processed back to the original payment
              method within 5–7 business days.
            </p>
          </section>

          <section>
            <h2>5. Room Access & Match Rules</h2>
            <p>
              Room ID and password are revealed only after successful payment
              and are strictly for registered players. Sharing these
              credentials with anyone — including teammates not registered on
              your team — is grounds for immediate disqualification without
              refund.
            </p>
            <p>
              Additional match rules (such as no teaming, no hacks, no
              emulator use in mobile-only matches) may be specified per
              tournament. It is your responsibility to read them before
              joining.
            </p>
          </section>

          <section>
            <h2>6. Fair Play Policy</h2>
            <p>The following are prohibited on Zyxport:</p>
            <ul>
              <li>
                <strong>Cheating</strong> — hacks, mods, aimbots, ESP, or any
                unauthorized third-party software.
              </li>
              <li>
                <strong>Teaming</strong> — collaborating with opponents in
                solo or non-squad formats.
              </li>
              <li>
                <strong>Account sharing</strong> — letting another person play
                on your registered account.
              </li>
              <li>
                <strong>Emulator use</strong> in mobile-only tournaments.
              </li>
              <li>
                <strong>Exploiting bugs</strong> or abusing the platform in
                any way.
              </li>
            </ul>
            <p>
              Violations may result in match disqualification, account
              suspension, or a permanent ban, depending on severity. All
              prize money forfeited due to cheating is non-refundable.
            </p>
          </section>

          <section>
            <h2>7. Prize Distribution</h2>
            <p>
              Prize money is transferred to the bank account or UPI ID
              registered in your profile. You must keep these details
              accurate — we are not responsible for transfers to incorrect
              accounts provided by the user.
            </p>
            <p>
              Payouts are processed within 48 hours after the winner is
              verified by our team. You will receive a transaction reference
              on your profile once the transfer is complete.
            </p>
            <p>
              Prize money may be subject to applicable taxes as per Indian
              law. Winners are responsible for their own tax compliance.
            </p>
          </section>

          <section>
            <h2>8. Intellectual Property</h2>
            <p>
              All content on Zyxport — including logos, tournament branding,
              website design, and code — is owned by Zyxport or licensed to
              us. You may not copy, reproduce, or redistribute any part
              without written permission.
            </p>
            <p>
              By posting content (such as match clips or screenshots) on our
              platform or social channels, you grant us a non-exclusive,
              royalty-free license to use it for marketing purposes.
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              Zyxport is not responsible for in-game issues that are beyond
              our control, including but not limited to:
            </p>
            <ul>
              <li>Server outages or lag from Krafton's side.</li>
              <li>Internet disconnections or device failures.</li>
              <li>Account bans imposed by Krafton independently of us.</li>
            </ul>
            <p>
              To the maximum extent permitted by law, our liability for any
              claim related to a tournament is limited to the entry fee you
              paid for that tournament.
            </p>
          </section>

          <section>
            <h2>10. Termination</h2>
            <p>
              We may suspend or terminate your account at any time if you
              violate these terms, cheat in a tournament, or engage in
              behavior that harms other users or the platform. You may also
              delete your account at any time by contacting support.
            </p>
          </section>

          <section>
            <h2>11. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes
              will be resolved in the courts of India, in the jurisdiction
              where Zyxport is registered.
            </p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>
              For questions about these terms, reach out at{" "}
              <a href="mailto:zqentra@gmail.com">support@zyxport.com</a> or
              through our <Link href="/contact">Contact page</Link>.
            </p>
          </section>
        </article>

        <footer className="legal-footer">
          <Link href="/privacy" className="legal-footer-link">
            Read our Privacy Policy →
          </Link>
        </footer>
      </div>
    </main>
  );
}