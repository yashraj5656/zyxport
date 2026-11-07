// app/organizer/OrganizerClient.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ShareButton from "./ShareButton";

const MODES = ["SQUAD TPP", "SOLO TPP", "DUO TPP", "SQUAD FPP", "SOLO FPP"];
const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik"];
const STATUSES = ["Open", "Filling Fast", "Almost Full", "Full", "Completed", "Cancelled"];
const COLORS = ["green", "purple", "orange"];

const emptyForm = {
  name: "", mode: "SQUAD TPP", map: "Erangel", entry: 0, prize: 2000,
  slots: 100, filled: 0, date: "", startTime: "", status: "Open",
  color: "green", roomId: "", roomPassword: "", sponsors: [], pageContent: {},
};

export default function OrganizerClient() {
  const [activeTab, setActiveTab] = useState("tournaments");
  const [tournaments, setTournaments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/organizer/tournaments");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (err) {
      console.error("Failed to load tournaments:", err);
      setError("Failed to load tournaments. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRegistrations() {
    setRegLoading(true);
    try {
      const res = await fetch("/api/organizer/registrations");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error("Failed to load registrations:", err);
      setError("Failed to load registrations. Please refresh the page.");
    } finally {
      setRegLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  
  useEffect(() => {
    if (activeTab === "registrations") loadRegistrations();
  }, [activeTab]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  }

  function startEdit(t) {
    setEditingId(t._id);
    setForm({
      name: t.name, mode: t.mode, map: t.map, entry: t.entry, prize: t.prize,
      slots: t.slots, filled: t.filled, date: t.date, startTime: t.startTime?.slice(0, 16) || "",
      status: t.status || "Open", color: t.color, roomId: t.roomId || "", roomPassword: t.roomPassword || "",
      sponsors: Array.isArray(t.sponsors) ? t.sponsors : [],
      pageContent: t.pageContent || {},
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const url = editingId ? `/api/organizer/tournaments/${editingId}` : "/api/organizer/tournaments";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Save failed");
        setSaving(false);
        return;
      }

      // If creating a new tournament, redirect to Razorpay Checkout for the prize pool
      if (!editingId) {
        const newTournamentId = data.tournament._id;
        await loadRazorpayScript();
        
        const options = {
          key: data.razorpayKeyId,
          amount: data.amount, 
          currency: "INR",
          name: "ZYXPORT Organizer",
          description: `Prize Pool Deposit for ${form.name}`,
          order_id: data.orderId,
          handler: async (response) => {
            const verifyRes = await fetch("/api/organizer/tournaments/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, tournamentId: newTournamentId }),
            });
            if (verifyRes.ok) {
              setSuccess("Tournament created and published successfully!");
              resetForm();
              load();
            } else {
              setError("Payment verified but publishing failed. Contact support.");
            }
          },
          theme: { color: "#b5ff36" },
          modal: { ondismiss: () => setSaving(false) }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setSuccess("Tournament updated");
        resetForm();
        load();
        setSaving(false);
      }
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this tournament?")) return;
    const res = await fetch(`/api/organizer/tournaments/${id}`, { method: "DELETE" });
    if (res.ok) { setSuccess("Deleted"); load(); }
  }

  async function handlePublishWinner(regId, tournamentId, prize, rank) {
    if (!confirm(`Confirm marking winner? This will publish them to the Leaderboard and initiate a ₹${prize} payout to their bank.`)) return;
    
    const res = await fetch(`/api/organizer/winners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId: regId, tournamentId, prizeAmount: prize, rank }),
    });

    if (res.ok) {
      setSuccess("Winner published and payout initiated!");
      
      // 👈 Instantly update the local state so all buttons in this group disable
      setRegistrations(prev => 
        prev.map(r => 
          r.tournament?._id === tournamentId 
            ? { ...r, tournament: { ...r.tournament, status: "Completed" } } 
            : r
        )
      );

    } else {
      const d = await res.json();
      setError(d.error || "Failed to publish winner");
    }
  }

  return (
    <>
      <div className="org-header-wrapper">
        <h1 className="admin-title" style={{ marginTop: 20 }}>
          {activeTab === "tournaments" ? (editingId ? "Edit Tournament" : "Host a Tournament") : "Registrations"}
        </h1>
        
        <div className="org-tabs-container">
          <button 
            onClick={() => { setActiveTab("tournaments"); resetForm(); }} 
            className={`org-tab ${activeTab === "tournaments" ? "active" : ""}`}
          >
            My Tournaments
          </button>
          <button 
            onClick={() => setActiveTab("registrations")} 
            className={`org-tab ${activeTab === "registrations" ? "active" : ""}`}
          >
            Player Registrations
          </button>
        </div>
      </div>

      {activeTab === "tournaments" && (
  <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
    <button 
      type="button"
      onClick={() => {
        document.getElementById("my-tournaments-list")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="org-scroll-btn"
    >
      ↓ Jump to My Tournaments
    </button>
  </div>
)}

      {error && <div className="auth-error" style={{ marginTop: 20 }}>{error}</div>}
      {success && <div className="profile-success" style={{ marginTop: 20 }}>{success}</div>}

      {activeTab === "tournaments" && (
        <>
          <form className="admin-form" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <div className="admin-form-grid">
              <label className="span-2">
                Tournament Name
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={80} />
              </label>

              <label>
                Mode
                <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                  {MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>

              <label>
                Map
                <select value={form.map} onChange={(e) => setForm({ ...form, map: e.target.value })}>
                  {MAPS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>

              <label>
                Prize Pool (₹) {editingId && <span style={{color:"var(--muted)", fontSize:10}}>(Locked)</span>}
                <input
                  type="number" min={0} value={form.prize}
                  onChange={(e) => setForm({ ...form, prize: e.target.value })}
                  required disabled={!!editingId} // 👈 Disabled on edit
                />
              </label>

              <label>
                Total Slots
                <input type="number" min={1} value={form.slots} onChange={(e) => setForm({ ...form, slots: e.target.value })} required />
              </label>

              <label>
                Display Date
                <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="Today, 8:00 PM" required />
              </label>

              <label>
                Start Time (actual)
                <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
              </label>

              <label>
                Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>

              <label>
                Banner Color
                <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
                  {COLORS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>

              <label>
                Room ID
                <input value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} placeholder="e.g. 81234567 (You can add this latter)" />
              </label>

              <label>
                Room Password
                <input value={form.roomPassword} onChange={(e) => setForm({ ...form, roomPassword: e.target.value })} placeholder="e.g. zyx123 (You can add this latter)" />
              </label>
            </div>

            <div className="admin-form-actions">
              {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Processing..." : editingId ? "Update Tournament" : `Pay ₹${form.prize} & Create`}
              </button>
            </div>
          </form>

          <h2 id="my-tournaments-list" className="admin-subtitle" style={{ marginTop: 40 }}>My Tournaments ({tournaments.length})</h2>
          {loading ? <p className="admin-loading">Loading...</p> : tournaments.length === 0 ? <p className="admin-empty">You haven't hosted any tournaments yet.</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Status</th><th>Start Time</th><th>Actions</th></tr>
                </thead>
                <tbody>
  {tournaments.map((t) => (
    <tr key={t._id}>
      <td data-label="Name"><strong>{t.name}</strong></td>
      <td data-label="Status">
        <span className={`admin-status status-${(t.status || "Open").replace(/\s/g, "-").toLowerCase()}`}>
          {t.status || "Open"}
        </span>
      </td>
      <td data-label="Start Time">{new Date(t.startTime).toLocaleString("en-IN")}</td>
      <td className="admin-actions-cell org-mobile-actions">
      <Link 
    href={`/tournaments/${t._id}`} 
    target="_blank" 
    className="admin-view-btn"
    title="View Public Page"
  >
    View
  </Link>
  <ShareButton title={t} />
        <button type="button" className="admin-edit-btn" onClick={() => startEdit(t)}>Edit</button>
        <button type="button" className="admin-delete-btn" onClick={() => handleDelete(t._id)}>Delete</button>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "registrations" && (
        <div style={{ marginTop: 20 }}>
          {regLoading ? (
            <p className="admin-loading">Loading...</p>
          ) : registrations.length === 0 ? (
            <p className="admin-empty">No players have registered yet.</p>
          ) : (
            <div className="org-reg-groups">
              {Object.values(
                registrations.reduce((acc, reg) => {
                  const tId = reg.tournament?._id || "unknown";
                  if (!acc[tId]) {
                    acc[tId] = {
                      tournament: reg.tournament,
                      players: [],
                    };
                  }
                  acc[tId].players.push(reg);
                  return acc;
                }, {})
              ).map((group, index) => (
                <details
                  key={group.tournament?._id || index}
                  className="org-reg-group"
                  open={index === 0}
                >
                  <summary className="org-reg-group-header">
                    <div className="org-reg-title">
                      <span className="org-reg-caret">▸</span>
                      <h3>{group.tournament?.name || "Unknown Tournament"}</h3>
                    </div>
                    <div className="org-reg-stats">
                      <span className="stat-chip">{group.players.length} Players</span>
                      <span className="stat-chip stat-revenue">
                        ₹{group.tournament?.prize || 0} Prize
                      </span>
                    </div>
                  </summary>

                  <div className="org-resp-table-wrap" style={{ border: "none", background: "transparent", borderRadius: 0 }}>
                    <table className="org-resp-table">
                      <thead>
                        <tr>
                          <th>Player Name</th>
                          <th>IGN</th>
                          <th>UID</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.players.map((r) => (
                          <tr key={r._id}>
                            <td data-label="Player">{r.user?.name}</td>
                            <td data-label="IGN">
                              <span style={{ color: "var(--green)", fontWeight: 700 }}>
                                {r.ign}
                              </span>
                            </td>
                            <td data-label="UID">{r.uid}</td>
                            <td data-label="Action" className="org-action-cell">
  {group.tournament?.status === "Completed" ? (
    <button
      className="admin-edit-btn"
      style={{ 
        width: "100%", 
        padding: "12px", 
        background: "rgba(255,255,255,0.05)", 
        color: "var(--muted)",
        cursor: "not-allowed",
        border: "1px dashed var(--border)"
      }}
      disabled
    >
      ✅ Winner Declared
    </button>
  ) : (
    <button
      onClick={() =>
        handlePublishWinner(
          r._id,
          r.tournament._id,
          r.tournament.prize,
          1
        )
      }
      className="admin-edit-btn"
      style={{ width: "100%", padding: "12px" }}
      title="Mark as Winner and Payout Prize"
    >
      🏆 Mark Winner
    </button>
  )}
</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    document.body.appendChild(script);
  });
}