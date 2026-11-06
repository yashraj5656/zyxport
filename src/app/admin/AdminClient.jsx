// app/admin/AdminClient.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const MODES = ["SQUAD TPP", "SOLO TPP", "DUO TPP", "SQUAD FPP", "SOLO FPP"];
const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik"];
const STATUSES = [
  "Open",
  "Filling Fast",
  "Almost Full",
  "Full",
  "Completed",
  "Cancelled",
];
const COLORS = ["green", "purple", "orange"];

const emptyForm = {
  name: "",
  mode: "SQUAD TPP",
  map: "Erangel",
  entry: 0,
  prize: 2000,
  slots: 100,
  filled: 0,
  date: "",
  startTime: "",
  status: "Open",
  color: "green",
  roomId: "",
  roomPassword: "",
  sponsors: [],
  pageContent: {},
  bannerImage: "", // 👈 Add this
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

  useEffect(() => {
    load();
  }, []);

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
      sponsors: Array.isArray(t.sponsors) ? t.sponsors : [],
      pageContent: t.pageContent || {},
      bannerImage: t.bannerImage || "", // 👈 Add this
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addSponsor() {
    setForm((prev) => ({
      ...prev,
      sponsors: [
        ...(prev.sponsors || []),
        { name: "", tagline: "", href: "#", logo: "🎯", tier: "gold" },
      ],
    }));
  }

  function updateSponsor(index, field, value) {
    setForm((prev) => ({
      ...prev,
      sponsors: (prev.sponsors || []).map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  }

  function removeSponsor(index) {
    setForm((prev) => ({
      ...prev,
      sponsors: (prev.sponsors || []).filter((_, i) => i !== index),
    }));
  }

  function updatePageContent(field, value) {
    setForm((prev) => ({
      ...prev,
      pageContent: { ...(prev.pageContent || {}), [field]: value },
    }));
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
    const res = await fetch(`/api/admin/tournaments/${id}`, {
      method: "DELETE",
    });
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
              {MODES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>

          <label>
            Map
            <select
              value={form.map}
              onChange={(e) => setForm({ ...form, map: e.target.value })}
            >
              {MAPS.map((m) => (
                <option key={m}>{m}</option>
              ))}
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
              onChange={(e) =>
                setForm({ ...form, roomPassword: e.target.value })
              }
              placeholder="e.g. zyx123"
            />
          </label>

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
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            Banner Color
            <select
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            >
              {COLORS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="span-2">
  Banner Image URL (Optional)
  <input
    value={form.bannerImage || ""}
    onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
    placeholder="https://example.com/image.jpg"
  />
</label>
        </div>

        {/* ═══ SPONSORS ═══ */}
        <div className="admin-sponsors-section">
          <div className="admin-sponsors-header">
            <div>
              <h3>Sponsors</h3>
              <p className="admin-sponsors-help">
                Each tournament has its own sponsor list. These appear on the
                tournament detail page.
              </p>
            </div>
            <button
              type="button"
              className="admin-add-sponsor-btn"
              onClick={addSponsor}
            >
              + Add Sponsor
            </button>
          </div>

          {(form.sponsors || []).length === 0 ? (
            <p className="admin-sponsors-empty">
              No sponsors added yet. Click "Add Sponsor" to create one.
            </p>
          ) : (
            <div className="admin-sponsors-list">
              {form.sponsors.map((sp, idx) => (
                <div key={idx} className="admin-sponsor-row">
                  <div className="admin-sponsor-row-header">
                    <span className="admin-sponsor-row-index">
                      Sponsor {idx + 1}
                    </span>
                    <button
                      type="button"
                      className="admin-sponsor-remove"
                      onClick={() => removeSponsor(idx)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="admin-sponsor-grid">
                    <label>
                      Name
                      <input
                        value={sp.name}
                        onChange={(e) =>
                          updateSponsor(idx, "name", e.target.value)
                        }
                        placeholder="e.g. Red Bull"
                        maxLength={60}
                      />
                    </label>

                    <label>
                      Tagline
                      <input
                        value={sp.tagline}
                        onChange={(e) =>
                          updateSponsor(idx, "tagline", e.target.value)
                        }
                        placeholder="e.g. Official Energy Partner"
                        maxLength={60}
                      />
                    </label>

                    <label>
                      Logo (emoji or URL)
                      <input
                        value={sp.logo}
                        onChange={(e) =>
                          updateSponsor(idx, "logo", e.target.value)
                        }
                        placeholder="🎯"
                        maxLength={500}
                      />
                    </label>

                    <label>
                      Link (optional)
                      <input
                        value={sp.href}
                        onChange={(e) =>
                          updateSponsor(idx, "href", e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </label>

                    <label>
                      Tier
                      <select
                        value={sp.tier}
                        onChange={(e) =>
                          updateSponsor(idx, "tier", e.target.value)
                        }
                      >
                        <option value="title">Title</option>
                        <option value="gold">Gold</option>
                        <option value="community">Community</option>
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ PAGE CONTENT ═══ */}
        <details className="admin-page-content-section">
          <summary className="admin-page-content-summary">
            <span>📄 Page Content (Brand Text, CTA, Headings)</span>
            <span className="admin-page-content-hint">
              Click to expand — all fields optional, defaults apply
            </span>
          </summary>

          <div className="admin-page-content-body">
            {/* ─── Brand ─── */}
            <h4 className="admin-page-content-group">Brand</h4>
            <div className="admin-form-grid">
              <label>
                Brand Name
                <input
                  value={form.pageContent?.brandName ?? ""}
                  onChange={(e) =>
                    updatePageContent("brandName", e.target.value)
                  }
                  placeholder="APEX ARENA"
                />
              </label>
              <label>
                Brand Tagline
                <input
                  value={form.pageContent?.brandTagline ?? ""}
                  onChange={(e) =>
                    updatePageContent("brandTagline", e.target.value)
                  }
                  placeholder="WHERE LEGENDS ARE FORGED"
                />
              </label>
              <label className="span-2">
                Brand Sub-tagline
                <input
                  value={form.pageContent?.brandSubTagline ?? ""}
                  onChange={(e) =>
                    updatePageContent("brandSubTagline", e.target.value)
                  }
                  placeholder="The official competitive circuit for BGMI..."
                />
              </label>
              <label>
                Website
                <input
                  value={form.pageContent?.brandWebsite ?? ""}
                  onChange={(e) =>
                    updatePageContent("brandWebsite", e.target.value)
                  }
                  placeholder="apexarena.gg"
                />
              </label>
            </div>

            {/* ─── CTA Section ─── */}
            <h4 className="admin-page-content-group">Brand CTA Section</h4>
            <div className="admin-form-grid">
              <label className="span-2">
                Eyebrow (small text above title)
                <input
                  value={form.pageContent?.ctaEyebrow ?? ""}
                  onChange={(e) =>
                    updatePageContent("ctaEyebrow", e.target.value)
                  }
                  placeholder="BECOME PART OF THE CIRCUIT"
                />
              </label>
              <label>
                Title Line 1
                <input
                  value={form.pageContent?.ctaTitleLine1 ?? ""}
                  onChange={(e) =>
                    updatePageContent("ctaTitleLine1", e.target.value)
                  }
                  placeholder="MORE THAN A"
                />
              </label>
              <label>
                Title Line 2 (green highlight)
                <input
                  value={form.pageContent?.ctaTitleLine2 ?? ""}
                  onChange={(e) =>
                    updatePageContent("ctaTitleLine2", e.target.value)
                  }
                  placeholder="TOURNAMENT PLATFORM."
                />
              </label>
              <label className="span-2">
                Subtitle
                <textarea
                  value={form.pageContent?.ctaSubtitle ?? ""}
                  onChange={(e) =>
                    updatePageContent("ctaSubtitle", e.target.value)
                  }
                  rows={3}
                  placeholder="Apex Arena is a full esports ecosystem..."
                />
              </label>
              <label>
                Primary Button Label
                <input
                  value={form.pageContent?.ctaPrimaryLabel ?? ""}
                  onChange={(e) =>
                    updatePageContent("ctaPrimaryLabel", e.target.value)
                  }
                  placeholder="JOIN THE CIRCUIT"
                />
              </label>
              <label>
                Primary Button Link
                <input
                  value={form.pageContent?.ctaPrimaryHref ?? ""}
                  onChange={(e) =>
                    updatePageContent("ctaPrimaryHref", e.target.value)
                  }
                  placeholder="/signup"
                />
              </label>
              <label>
                Secondary Button Label
                <input
                  value={form.pageContent?.ctaSecondaryLabel ?? ""}
                  onChange={(e) =>
                    updatePageContent("ctaSecondaryLabel", e.target.value)
                  }
                  placeholder="EXPLORE ALL TOURNAMENTS"
                />
              </label>
              <label>
                Secondary Button Link
                <input
                  value={form.pageContent?.ctaSecondaryHref ?? ""}
                  onChange={(e) =>
                    updatePageContent("ctaSecondaryHref", e.target.value)
                  }
                  placeholder="/tournaments"
                />
              </label>
            </div>

            {/* ─── CTA Highlights (4 stats) ─── */}
            <h4 className="admin-page-content-group">CTA Highlights (4 stats)</h4>
            <div className="admin-form-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} style={{ display: "contents" }}>
                  <label>
                    Stat {n} — Value
                    <input
                      value={
                        form.pageContent?.[`ctaHighlight${n}Value`] ?? ""
                      }
                      onChange={(e) =>
                        updatePageContent(
                          `ctaHighlight${n}Value`,
                          e.target.value
                        )
                      }
                      placeholder={["24/7", "100%", "48H", "BGMI"][n - 1]}
                    />
                  </label>
                  <label>
                    Stat {n} — Label
                    <input
                      value={
                        form.pageContent?.[`ctaHighlight${n}Label`] ?? ""
                      }
                      onChange={(e) =>
                        updatePageContent(
                          `ctaHighlight${n}Label`,
                          e.target.value
                        )
                      }
                      placeholder={
                        [
                          "Competition",
                          "Free Entry",
                          "Prize Payouts",
                          "Battle Ready",
                        ][n - 1]
                      }
                    />
                  </label>
                </div>
              ))}
            </div>

            {/* ─── Sponsor Wall ─── */}
            <h4 className="admin-page-content-group">Sponsor Wall Header</h4>
            <div className="admin-form-grid">
              <label className="span-2">
                Eyebrow
                <input
                  value={form.pageContent?.sponsorWallEyebrow ?? ""}
                  onChange={(e) =>
                    updatePageContent("sponsorWallEyebrow", e.target.value)
                  }
                  placeholder="THE CIRCUIT IS POWERED BY"
                />
              </label>
              <label className="span-2">
                Title
                <input
                  value={form.pageContent?.sponsorWallTitle ?? ""}
                  onChange={(e) =>
                    updatePageContent("sponsorWallTitle", e.target.value)
                  }
                  placeholder="BACKED BY THE BEST."
                />
              </label>
              <label className="span-2">
                Subtitle
                <textarea
                  value={form.pageContent?.sponsorWallSubtitle ?? ""}
                  onChange={(e) =>
                    updatePageContent("sponsorWallSubtitle", e.target.value)
                  }
                  rows={2}
                />
              </label>
              <label className="span-2">
                Empty State Text (when no sponsors added)
                <textarea
                  value={form.pageContent?.sponsorWallEmptyText ?? ""}
                  onChange={(e) =>
                    updatePageContent("sponsorWallEmptyText", e.target.value)
                  }
                  rows={2}
                />
              </label>
            </div>

            {/* ─── Register Section ─── */}
            <h4 className="admin-page-content-group">Register Section</h4>
            <div className="admin-form-grid">
              <label>
                Eyebrow
                <input
                  value={form.pageContent?.registerEyebrow ?? ""}
                  onChange={(e) =>
                    updatePageContent("registerEyebrow", e.target.value)
                  }
                  placeholder="YOUR MOMENT STARTS HERE"
                />
              </label>
              <label>
                Title
                <input
                  value={form.pageContent?.registerTitle ?? ""}
                  onChange={(e) =>
                    updatePageContent("registerTitle", e.target.value)
                  }
                  placeholder="CLAIM YOUR PLACE."
                />
              </label>
              <label className="span-2">
                Subtitle
                <input
                  value={form.pageContent?.registerSubtitle ?? ""}
                  onChange={(e) =>
                    updatePageContent("registerSubtitle", e.target.value)
                  }
                  placeholder="Free to enter. Real prizes. Real competition."
                />
              </label>
            </div>

            {/* ─── Footer ─── */}
            <h4 className="admin-page-content-group">Footer</h4>
            <div className="admin-form-grid">
              <label className="span-2">
                Tagline Line 1
                <input
                  value={form.pageContent?.footerTaglineLine1 ?? ""}
                  onChange={(e) =>
                    updatePageContent("footerTaglineLine1", e.target.value)
                  }
                  placeholder="Every match. Every kill. Every victory."
                />
              </label>
              <label className="span-2">
                Tagline Line 2 (green)
                <input
                  value={form.pageContent?.footerTaglineLine2 ?? ""}
                  onChange={(e) =>
                    updatePageContent("footerTaglineLine2", e.target.value)
                  }
                  placeholder="WHERE LEGENDS ARE FORGED"
                />
              </label>
              <label className="span-2">
                Back Link Label
                <input
                  value={form.pageContent?.footerBackLabel ?? ""}
                  onChange={(e) =>
                    updatePageContent("footerBackLabel", e.target.value)
                  }
                  placeholder="← Back to all tournaments"
                />
              </label>
            </div>
          </div>
        </details>

        <div className="admin-form-actions">
          {editingId && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
        </div>
      </form>

      <h2 className="admin-subtitle">
        All Tournaments ({tournaments.length})
      </h2>

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : tournaments.length === 0 ? (
        <p className="admin-empty">
          No tournaments yet — create your first one above.
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mode</th>
                <th>Map</th>
                <th>Prize</th>
                <th>Slots</th>
                <th>Status</th>
                <th>Start</th>
                <th>Sponsors</th>
                <th>Actions</th>
                <th>Organizer</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.mode}</td>
                  <td>{t.map}</td>
                  <td>₹{t.prize.toLocaleString("en-IN")}</td>
                  <td>
                    {t.filled}/{t.slots}
                  </td>
                  <td>
                    <span
                      className={`admin-status status-${t.status
                        .replace(/\s/g, "-")
                        .toLowerCase()}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>{new Date(t.startTime).toLocaleString("en-IN")}</td>
                  <td>{(t.sponsors || []).length}</td>
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
                  <td>
  {t.organizer ? (
    <span style={{ color: "var(--green)", fontSize: "12px" }}>
      {t.organizer.name}
    </span>
  ) : (
    <span style={{ color: "var(--muted)" }}>ZYXPORT Admin</span>
  )}
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