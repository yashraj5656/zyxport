import Link from "next/link";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div>
          <Link href="/" className="logo footer-logo">
            ZYX<span>PORT</span>
            <small>ESPORTS</small>
          </Link>
          <p>
            Compete. Conquer. Become a champion.
            Your esports journey starts here.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <strong>Explore</strong>
            <Link href="/tournaments">Tournaments</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/about">About Us</Link>
          </div>

          <div>
            <strong>Support</strong>
            <Link href="/contact">Contact Us</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>

          <div>
            <strong>Account</strong>
            <Link href="/login">Login</Link>
            <Link href="/signup">Register</Link>
            <Link href="/profile">My Profile</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Zyxport. All rights reserved.</span>
        <span>MADE FOR THE COMPETITIVE SPIRIT.</span>
      </div>
    </footer>
  );
}