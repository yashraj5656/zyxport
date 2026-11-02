// app/profile/ProfileClient.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BankDetailsSection from "./BankDetailsSection";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatMoney(n) {
  return `₹${(n || 0).toLocaleString("en-IN")}`;
}

export default function ProfileClient({
  user,
  stats = {},
  wins = [],
  initialBank = null,
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    ign: user?.ign || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }

      setMessage("Profile updated successfully");
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <>
      {/* HEADER CARD */}
      <section className="profile-header-card">
        <div className="profile-hero">
          <div className="profile-avatar-xl">
            {form.avatar ? (
              <span className="avatar-emoji">{form.avatar}</span>
            ) : (
              getInitials(user?.name)
            )}
          </div>

          <div className="profile-hero-info">
            <h1>{user?.name}</h1>
            {user?.ign && <p className="profile-ign">@{user.ign}</p>}
            <p className="profile-email">{user?.email}</p>
            <p className="profile-joined">
              ⚡ Joined {formatDate(user?.createdAt)}
            </p>
          </div>

          <button
            type="button"
            className="profile-edit-toggle"
            onClick={() => {
              setEditing((v) => !v);
              setMessage("");
              setError("");
            }}
          >
            {editing ? "Cancel" : "✎ Edit Profile"}
          </button>
        </div>

        {user?.bio && !editing && (
          <p className="profile-bio">{user.bio}</p>
        )}
      </section>

      {/* EDIT FORM */}
      {editing && (
        <section className="profile-card">
          <h2>Edit Profile</h2>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="profile-success">{message}</div>}

          <form onSubmit={handleSave} className="profile-form">
            <label>
              Display Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
              />
            </label>

            <label>
              In-Game Name (IGN)
              <input
                type="text"
                value={form.ign}
                onChange={(e) => setForm({ ...form, ign: e.target.value })}
                maxLength={32}
                placeholder="e.g. ShadowKiller99"
              />
            </label>

            <label>
              Avatar (emoji)
              <input
                type="text"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                maxLength={4}
                placeholder="e.g. 🐺"
              />
            </label>

            <label>
              Bio
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                maxLength={280}
                rows={4}
                placeholder="Tell other players about yourself..."
              />
              <small className="char-count">{form.bio.length}/280</small>
            </label>

            <div className="profile-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* BANK DETAILS */}
      <BankDetailsSection initialBank={initialBank} />

      {/* STATS */}
      <section className="profile-stats-grid">
        <div className="profile-stat-card">
          <span className="profile-stat-icon">🏆</span>
          <strong>{stats.wins ?? 0}</strong>
          <small>Tournaments Won</small>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-icon">💰</span>
          <strong>{formatMoney(stats.totalEarnings)}</strong>
          <small>Total Earnings</small>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-icon">⏳</span>
          <strong>{formatMoney(stats.pendingPayout)}</strong>
          <small>Pending Payout</small>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-icon">⚔</span>
          <strong>{stats.totalKills ?? 0}</strong>
          <small>Total Kills</small>
        </div>
      </section>

      {/* MATCH HISTORY */}
      <section className="profile-card">
        <h2>Match History</h2>

        {wins.length === 0 ? (
          <p
            style={{
              color: "var(--muted)",
              fontSize: 13,
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No tournament wins yet. Keep grinding — your first win is close!
          </p>
        ) : (
          <div className="profile-wins-list">
            {wins.map((w) => (
              <div key={w.id} className="profile-win-item">
                <div className="profile-win-rank">
                  {w.rank === 1 ? "🥇" : w.rank === 2 ? "🥈" : w.rank === 3 ? "🥉" : `#${w.rank}`}
                </div>
                <div className="profile-win-info">
                  <strong>Rank #{w.rank}</strong>
                  <small>
                    {w.kills} kills · {formatDate(w.createdAt)}
                  </small>
                </div>
                <div className="profile-win-payout">
                  <strong>{formatMoney(w.prizeAmount)}</strong>
                  {w.paidToBank ? (
                    <span className="win-status win-paid">✓ Paid</span>
                  ) : (
                    <span className="win-status win-pending">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* QUICK LINKS */}
      <section className="profile-card">
        <h2>Quick Links</h2>
        <div className="profile-quick-links">
          <Link href="/tournaments" className="profile-link">
            <span>🎮</span>
            <div>
              <strong>Browse Tournaments</strong>
              <small>Join your next match</small>
            </div>
            <span className="chev">→</span>
          </Link>

          <Link href="/leaderboard" className="profile-link">
            <span>🏆</span>
            <div>
              <strong>Leaderboard</strong>
              <small>See where you rank</small>
            </div>
            <span className="chev">→</span>
          </Link>

          <Link href="/tournaments" className="profile-link">
            <span>📋</span>
            <div>
              <strong>My Matches</strong>
              <small>View your history</small>
            </div>
            <span className="chev">→</span>
          </Link>
        </div>
      </section>

      {/* ACCOUNT ACTIONS */}
      <section className="profile-card profile-danger-zone">
        <h2>Account</h2>
        <div className="profile-account-actions">
          <div>
            <strong>Log out</strong>
            <small>You will need to log in again.</small>
          </div>
          <button
            type="button"
            className="profile-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </section>
    </>
  );
}