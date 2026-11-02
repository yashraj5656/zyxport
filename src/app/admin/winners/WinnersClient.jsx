"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function WinnersClient() {
  const [winners, setWinners] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [form, setForm] = useState({
    userId: "",
    rank: 1,
    prizeAmount: "",
    kills: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadWinners() {
    setLoading(true);
    const [wRes, tRes] = await Promise.all([
      fetch("/api/admin/winners"),
      fetch("/api/admin/tournaments"),
    ]);
    const wData = await wRes.json();
    const tData = await tRes.json();
    if (wRes.ok) setWinners(wData.winners || []);
    if (tRes.ok) setTournaments(tData.tournaments || []);
    setLoading(false);
  }

  useEffect(() => {
    loadWinners();
  }, []);

  useEffect(() => {
    if (!selectedTournament) {
      setRegistrations([]);
      return;
    }
    (async () => {
      const res = await fetch(
        `/api/admin/tournaments/${selectedTournament}/registrations`
      );
      const data = await res.json();
      if (res.ok) setRegistrations(data.registrations || []);
    })();
  }, [selectedTournament]);

  async function addWinner(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/winners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: selectedTournament,
          ...form,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed");
      } else {
        setSuccess("Winner added");
        setForm({ userId: "", rank: 1, prizeAmount: "", kills: 0 });
        loadWinners();
      }
    } finally {
      setSaving(false);
    }
  }

  async function togglePaid(winner) {
    const ref = winner.paidToBank
      ? ""
      : prompt("Transaction reference / UTR (optional):") || "";
    const res = await fetch(`/api/admin/winners/${winner.id}/pay`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paidToBank: !winner.paidToBank,
        payoutReference: ref,
      }),
    });
    if (res.ok) loadWinners();
  }

  async function deleteWinner(id) {
    if (!confirm("Remove this winner record?")) return;
    await fetch(`/api/admin/winners/${id}`, { method: "DELETE" });
    loadWinners();
  }

  return (
    <>
      <div className="admin-reg-header">
        <div>
          <Link href="/admin" className="admin-back">
            ← Back to tournaments
          </Link>
          <h1 className="admin-title">Winners & Payouts</h1>
          <p className="admin-subtitle-line">
            Mark winners and toggle "Paid to bank" after payout
          </p>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      {/* ADD WINNER */}
      <section className="admin-form">
        <h2 className="admin-subtitle">Mark a Winner</h2>
        <form onSubmit={addWinner}>
          <div className="admin-form-grid">
            <label className="span-2">
              Tournament
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                required
              >
                <option value="">Select tournament...</option>
                {tournaments.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="span-2">
              User (only paid registrations)
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                required
                disabled={!selectedTournament}
              >
                <option value="">Select user...</option>
                {registrations
                  .filter((r) => r.paymentStatus === "paid")
                  .map((r) => (
                    <option key={r.user?.id} value={r.user?.id}>
                      {r.user?.name} ({r.user?.email}) — IGN: {r.ign}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Rank
              <input
                type="number"
                min={1}
                value={form.rank}
                onChange={(e) => setForm({ ...form, rank: e.target.value })}
                required
              />
            </label>

            <label>
              Prize Amount (₹)
              <input
                type="number"
                min={0}
                value={form.prizeAmount}
                onChange={(e) =>
                  setForm({ ...form, prizeAmount: e.target.value })
                }
                required
              />
            </label>

            <label>
              Kills
              <input
                type="number"
                min={0}
                value={form.kills}
                onChange={(e) => setForm({ ...form, kills: e.target.value })}
              />
            </label>
          </div>

          <div className="admin-form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving || !selectedTournament}
            >
              {saving ? "Adding..." : "Add Winner"}
            </button>
          </div>
        </form>
      </section>

      {/* LIST */}
      <h2 className="admin-subtitle">All Winners ({winners.length})</h2>

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : winners.length === 0 ? (
        <p className="admin-empty">No winners marked yet.</p>
      ) : (
        <div className="admin-winners-list">
          {winners.map((w) => (
            <div key={w.id} className="winner-card">
              <div className="winner-card-head">
                <div>
                  <h3>
                    #{w.rank} — {w.user?.name || "—"}
                  </h3>
                  <small>
                    {w.tournament?.name} · {w.kills} kills ·{" "}
                    <strong>₹{w.prizeAmount}</strong>
                  </small>
                </div>

                <div className="winner-actions">
                  <button
                    type="button"
                    className={`winner-pay-btn ${
                      w.paidToBank ? "paid" : ""
                    }`}
                    onClick={() => togglePaid(w)}
                  >
                    {w.paidToBank ? "✓ Paid to Bank" : "Mark as Paid"}
                  </button>
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={() => deleteWinner(w.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="winner-details-grid">
                <div>
                  <small>Email</small>
                  <strong>{w.user?.email || "—"}</strong>
                </div>
                <div>
                  <small>Account Holder</small>
                  <strong>{w.bank?.accountHolderName || "Not set"}</strong>
                </div>
                <div>
                  <small>Account Number</small>
                  <strong className="reg-mono">
                    {w.bank?.accountNumber || "—"}
                  </strong>
                </div>
                <div>
                  <small>IFSC</small>
                  <strong className="reg-mono">
                    {w.bank?.ifscCode || "—"}
                  </strong>
                </div>
                <div>
                  <small>Bank</small>
                  <strong>{w.bank?.bankName || "—"}</strong>
                </div>
                <div>
                  <small>UPI</small>
                  <strong>{w.bank?.upiId || "—"}</strong>
                </div>
              </div>

              {w.paidToBank && (
                <p className="winner-paid-note">
                  ✓ Paid on{" "}
                  {new Date(w.paidAt).toLocaleString("en-IN")}
                  {w.payoutReference && ` · Ref: ${w.payoutReference}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}