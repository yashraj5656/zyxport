"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function TournamentDetailClient({
  tournament,
  isLoggedIn,
  isPaid,
  registrationId,
}) {
  const router = useRouter();
  const [ign, setIgn] = useState("");
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(isPaid);
  const [roomJustAppeared, setRoomJustAppeared] = useState(false);
  const [copied, setCopied] = useState("");
  const previousRoomIdRef = useRef(null);
  const intervalRef = useRef(null);

  // ── Fetch room data ────────────────────────────────────
  async function fetchRoom({ silent = false } = {}) {
    if (!silent) setRoomLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/room`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) return;

      // If room ID just appeared → flag for animation
      if (
        data.roomId &&
        previousRoomIdRef.current !== data.roomId &&
        previousRoomIdRef.current !== null
      ) {
        setRoomJustAppeared(true);
        setTimeout(() => setRoomJustAppeared(false), 4000);
      }
      previousRoomIdRef.current = data.roomId || "";
      setRoom(data);
    } catch {
      /* silent fail */
    } finally {
      if (!silent) setRoomLoading(false);
    }
  }

  // ── Fetch on mount if paid ─────────────────────────────
  useEffect(() => {
    if (!isPaid) return;
    fetchRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid]);

  // ── Auto-refresh while room not yet published ──────────
  useEffect(() => {
    if (!isPaid) return;
    if (room?.roomId) return; // already published → stop polling

    intervalRef.current = setInterval(() => {
      fetchRoom({ silent: true });
    }, 30000); // every 30 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid, room?.roomId]);

  // ── Register ───────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ign, uid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push(`/tournaments/${tournament.id}/pay`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }

  // ── Determine room state ───────────────────────────────
  const isCancelled = tournament.status === "Cancelled";
  const isCompleted = tournament.status === "Completed";
  const matchStarted =
    tournament.startTime && new Date(tournament.startTime) <= new Date();
  const hasRoom = !!room?.roomId;

  return (
    <>
      {/* ...header and stats section unchanged... */}

      {error && <div className="auth-error">{error}</div>}

      {!isLoggedIn && (
        <div className="detail-card">
          <h2>Login Required</h2>
          <p>You need to log in to register for this tournament.</p>
          <a href="/login" className="primary-button">Login</a>
        </div>
      )}

      {isLoggedIn && !isPaid && (
        <div className="detail-card">
          <h2>Register for this Tournament</h2>
          <p className="detail-sub">
            Enter your BGMI in-game details. These must match your game account.
          </p>
          <form className="detail-form" onSubmit={handleRegister}>
            <label>
              In-Game Name (IGN)
              <input
                value={ign}
                onChange={(e) => setIgn(e.target.value)}
                required
                maxLength={32}
              />
            </label>
            <label>
              BGMI UID
              <input
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                required
                maxLength={20}
              />
            </label>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Please wait..." : `Register & Pay ₹${tournament.entry}`}
            </button>
          </form>
        </div>
      )}

      {/* ── PAID: ROOM CARD ─────────────────────────── */}
      {isPaid && (
        <div
          className={`detail-card room-unlocked ${
            roomJustAppeared ? "room-flash" : ""
          }`}
        >
          <h2>🔓 Room Details Unlocked</h2>
          <p className="detail-sub">
            You're registered. Join the room in BGMI at match time.
          </p>

          {/* Cancelled */}
          {isCancelled ? (
            <div className="room-state room-cancelled">
              ❌ This tournament was cancelled. If you paid, contact support for a refund.
            </div>
          ) : isCompleted ? (
            <div className="room-state room-completed">
              ✔ This match has ended. Thanks for playing!
            </div>
          ) : roomLoading ? (
            <div className="room-state room-loading">
              <span className="spinner" /> Loading room details...
            </div>
          ) : hasRoom ? (
            <>
              <div className="room-field">
                <div>
                  <small>Room ID</small>
                  <strong>{room.roomId}</strong>
                </div>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyToClipboard(room.roomId, "roomId")}
                >
                  {copied === "roomId" ? "✓ Copied" : "Copy"}
                </button>
              </div>

              <div className="room-field">
                <div>
                  <small>Room Password</small>
                  <strong>{room.roomPassword || "(no password)"}</strong>
                </div>
                {room.roomPassword && (
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => copyToClipboard(room.roomPassword, "pw")}
                  >
                    {copied === "pw" ? "✓ Copied" : "Copy"}
                  </button>
                )}
              </div>

              <p className="room-warning">
                ⚠️ Do not share these with anyone. Sharing results in disqualification.
              </p>
            </>
          ) : (
            /* Not published yet */
            <div className="room-state room-pending">
              <div className="room-pending-header">
                <span className="room-pending-icon">⏳</span>
                <div>
                  <strong>Room details not published yet</strong>
                  <p>
                    The organizer will publish the room ID and password shortly
                    before the match starts. This page auto-refreshes every 30
                    seconds — you can leave it open, or come back closer to
                    match time.
                  </p>
                </div>
              </div>

              <div className="room-pending-actions">
                <button
                  type="button"
                  className="admin-refresh-btn"
                  onClick={() => fetchRoom()}
                  disabled={roomLoading}
                >
                  {roomLoading ? "Checking..." : "↻ Check now"}
                </button>
              </div>

              {matchStarted && (
                <p className="room-late-note">
                  ⚠️ Match start time has passed and the room still isn't
                  published. Contact the organizer — they may be running late.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}