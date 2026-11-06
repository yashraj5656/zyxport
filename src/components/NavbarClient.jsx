"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import "./Navbar.css";

export default function NavbarClient({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const profileRef = useRef(null);

  // ─── Close mobile menu on route change ───
  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // ─── Lock body scroll while mobile menu is open ───
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ─── Close profile dropdown when clicking outside ───
  useEffect(() => {
    if (!isProfileOpen) return;
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isProfileOpen]);

  // ─── Close menu when Escape is pressed ───
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // ─── Safe user derivations ───
  const userName = user?.name ?? "";
  const userEmail = user?.email ?? "";
  const userIsAdmin = user?.isAdmin === true;
  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (err) {
      console.error(err);
    } finally {
      window.location.href = "/";
    }
  }

  // ─── Helper: close menu after any link click ───
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
          ZYX<span>PORT</span>
          <small>ESPORTS</small>
        </Link>

        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>
          <Link href="/tournaments" onClick={closeMenu}>
            Tournaments
          </Link>
          <Link href="/leaderboard" onClick={closeMenu}>
            Leaderboard
          </Link>

          {userIsAdmin ? (
  <Link href="/admin" onClick={closeMenu}>
    ⚙ Admin Panel
  </Link>
) : user?.isOrganizer ? (
  <Link href="/organizer" onClick={closeMenu}>
    Organizer Dashboard
  </Link>
) : (
  <Link href="/organizers" onClick={closeMenu}>
    Become Organizer
  </Link>
)}
          <Link href="/guides" onClick={closeMenu}>
          Guides</Link>
          <Link href="/about" onClick={closeMenu}>
            About
          </Link>

          <div className="mobile-auth">
            {user ? (
              <>
                {userIsAdmin && (
                  <Link
                    href="/admin"
                    className="login-link"
                    onClick={closeMenu}
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="login-link"
                  onClick={closeMenu}
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  className="signup-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="login-link"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="signup-button"
                  onClick={closeMenu}
                >
                  Get Started <span>↗</span>
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="profile-menu" ref={profileRef}>
              <button
                type="button"
                className="profile-trigger"
                onClick={() => setIsProfileOpen((p) => !p)}
                aria-label="Open profile menu"
                aria-expanded={isProfileOpen}
              >
                <span className="profile-avatar">{initials}</span>
                <span className="profile-name">
                  {userName.split(" ")[0]}
                </span>
                <svg
                  className={`profile-caret ${isProfileOpen ? "open" : ""}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <span className="profile-avatar large">{initials}</span>
                    <div>
                      <strong>{userName}</strong>
                      <small>{userEmail}</small>
                    </div>
                  </div>

                  <Link href="/profile" className="profile-item">
                    👤 My Profile
                  </Link>
                  <Link href="/tournaments" className="profile-item">
                    🎮 Tournaments
                  </Link>
                  <Link href="/leaderboard" className="profile-item">
                    🏆 Leaderboard
                  </Link>

                 

{userIsAdmin ? (
  <Link href="/admin" className="profile-item">
    ⚙ Admin Panel
  </Link>
) : user?.isOrganizer ? (
  <Link href="/organizer" className="profile-item">
    🎮 Organizer Dashboard
  </Link>
) : (
  <Link href="/organizers" className="profile-item">
    🚀 Become Organizer
  </Link>
)}

                  <button
                    type="button"
                    className="profile-item danger"
                    onClick={handleLogout}
                  >
                    ⏻ Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="login-link">
                Login
              </Link>
              <Link href="/signup" className="signup-button">
                Get Started <span>↗</span>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen((p) => !p)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {isOpen && (
        <div
          className="nav-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}