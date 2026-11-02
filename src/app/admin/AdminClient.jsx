// app/admin/AdminClient.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const MODES = ["SQUAD TPP", "SOLO TPP", "DUO TPP", "SQUAD FPP", "SOLO FPP"];
const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik"];
const STATUSES = ["Open", "Filling Fast", "Almost Full", "Full", "Completed", "Cancelled"];
const COLORS = ["green", "purple", "orange"];

const emptyForm = {
  name: "",
  mode: "SQUAD TPP",
  map: "Erangel",
  entry: 50,
  prize: 2000,
  slots: 100,
  filled: 0,
  date: "",
  startTime: "",
  status: "Open",
  color: "green",
  roomId: "",        
  roomPassword: "",   
};

export default function AdminClient() {
  const [tournaments, setTournaments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/tournaments");
    const data = await res.json();
    if (res.ok) setTournaments(data.tournaments || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  }

  function startEdit(t) {
    setEditingId(t._id);
    setForm({
      name: t.name,
      mode: t.mode,
      map: t.map,
      entry: t.entry,
      prize: t.prize,
      slots: t.slots,
      filled: t.filled,
      date: t.date,
      startTime: t.startTime?.slice(0, 16) || "",
      status: t.status,
      color: t.color,
      roomId: t.roomId || "",
      roomPassword: t.roomPassword || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const url = editingId
      ? `/api/admin/tournaments/${editingId}`
      : "/api/admin/tournaments";
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
      } else {
        setSuccess(editingId ? "Tournament updated" : "Tournament created");
        resetForm();
        load();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this tournament?")) return;
    const res = await fetch(`/api/admin/tournaments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSuccess("Deleted");
      load();
    }
  }

  return (
    <>
      <h1 className="admin-title">
        {editingId ? "Edit Tournament" : "Create Tournament"}
      </h1>
      <div className="admin-nav-links">
  <Link href="/admin/registrations" className="admin-nav-link">
    👥 Registrations →
  </Link>
  <Link href="/admin/winners" className="admin-nav-link">
    🏆 Winners & Payouts →
  </Link>
  <Link href="/admin/messages" className="admin-nav-link">
  📬 Contact Messages →
</Link>
</div>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label className="span-2">
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={80}
            />
          </label>

          <label>
            Mode
            <select
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
            >
              {MODES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>

          <label>
            Map
            <select
              value={form.map}
              onChange={(e) => setForm({ ...form, map: e.target.value })}
            >
              {MAPS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>

          <label>
  Room ID
  <input
    value={form.roomId}
    onChange={(e) => setForm({ ...form, roomId: e.target.value })}
    placeholder="e.g. 81234567"
  />
</label>

<label>
  Room Password
  <input
    value={form.roomPassword}
    onChange={(e) => setForm({ ...form, roomPassword: e.target.value })}
    placeholder="e.g. zyx123"
  />
</label>

          {/*<label>
            Entry Fee (₹)
            <input
              type="number"
              min={0}
              value={form.entry}
              onChange={(e) => setForm({ ...form, entry: e.target.value })}
              required
            />
          </label>*/}

          <label>
            Prize Pool (₹)
            <input
              type="number"
              min={0}
              value={form.prize}
              onChange={(e) => setForm({ ...form, prize: e.target.value })}
              required
            />
          </label>

          <label>
            Total Slots
            <input
              type="number"
              min={1}
              value={form.slots}
              onChange={(e) => setForm({ ...form, slots: e.target.value })}
              required
            />
          </label>

          <label>
            Filled Slots
            <input
              type="number"
              min={0}
              value={form.filled}
              onChange={(e) => setForm({ ...form, filled: e.target.value })}
            />
          </label>

          <label>
            Display Date
            <input
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              placeholder="Today, 8:00 PM"
              required
            />
          </label>

          <label>
            Start Time (actual)
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>

          <label>
            Banner Color
            <select
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            >
              {COLORS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className="admin-form-actions">
          {editingId && (
            <button type="button" className="secondary-button" onClick={resetForm}>
              Cancel
            </button>
          )}
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
        </div>
      </form>

      <h2 className="admin-subtitle">All Tournaments ({tournaments.length})</h2>

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : tournaments.length === 0 ? (
        <p className="admin-empty">No tournaments yet — create your first one above.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mode</th>
                <th>Map</th>
                <th>Entry</th>
                <th>Prize</th>
                <th>Slots</th>
                <th>Status</th>
                <th>Start</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.mode}</td>
                  <td>{t.map}</td>
                  <td>₹{t.entry}</td>
                  <td>₹{t.prize.toLocaleString("en-IN")}</td>
                  <td>{t.filled}/{t.slots}</td>
                  <td>
                    <span className={`admin-status status-${t.status.replace(/\s/g, "-").toLowerCase()}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>{new Date(t.startTime).toLocaleString("en-IN")}</td>
                  <td className="admin-actions-cell">
                    <button
                      type="button"
                      className="admin-edit-btn"
                      onClick={() => startEdit(t)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-delete-btn"
                      onClick={() => handleDelete(t._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}