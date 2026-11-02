// app/admin/registrations/RegistrationsClient.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const STATUS_OPTIONS = ["all", "paid", "pending", "failed", "refunded"];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RegistrationsClient() {
  const [groups, setGroups] = useState([]);
  const [totals, setTotals] = useState({ registrations: 0, paid: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tournamentFilter, setTournamentFilter] = useState("all");
  const [expanded, setExpanded] = useState({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/registrations");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load");
        return;
      }
      setGroups(data.groups || []);
      setTotals(data.totals || { registrations: 0, paid: 0, revenue: 0 });

      // Auto-expand the first tournament
      const init = {};
      (data.groups || []).forEach((g, i) => {
        init[g.tournament.id] = i === 0;
      });
      setExpanded(init);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Apply filters
  const filteredGroups = useMemo(() => {
    return groups
      .map((g) => {
        // Filter by tournament name
        if (
          tournamentFilter !== "all" &&
          g.tournament.id !== tournamentFilter
        ) {
          return null;
        }

        const rows = g.registrations.filter((r) => {
          if (statusFilter !== "all" && r.paymentStatus !== statusFilter) {
            return false;
          }
          if (search) {
            const q = search.toLowerCase();
            const hay = `${r.user.name} ${r.user.email} ${r.ign} ${r.uid}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        });

        if (rows.length === 0) return null;
        return { ...g, registrations: rows };
      })
      .filter(Boolean);
  }, [groups, search, statusFilter, tournamentFilter]);

  function toggle(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) {
    return <p className="admin-loading">Loading registrations...</p>;
  }

  return (
    <>
      <div className="admin-reg-header">
        <div>
          <Link href="/admin" className="admin-back">← Back to tournaments</Link>
          <h1 className="admin-title">Registrations</h1>
          <p className="admin-subtitle-line">
            See who registered for which tournament
          </p>
        </div>

        <button type="button" className="admin-refresh-btn" onClick={load}>
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="reg-summary">
        <div className="reg-summary-card">
          <small>Total Registrations</small>
          <strong>{totals.registrations}</strong>
        </div>
        <div className="reg-summary-card">
          <small>Paid</small>
          <strong className="green">{totals.paid}</strong>
        </div>
        <div className="reg-summary-card">
          <small>Total Revenue</small>
          <strong className="green">
            ₹{totals.revenue.toLocaleString("en-IN")}
          </strong>
        </div>
      </div>

      {/* FILTERS */}
      <div className="reg-filters">
        <input
          className="reg-search"
          type="search"
          placeholder="Search by name, email, IGN, or UID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="reg-select"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={tournamentFilter}
          onChange={(e) => setTournamentFilter(e.target.value)}
          className="reg-select"
        >
          <option value="all">All tournaments</option>
          {groups.map((g) => (
            <option key={g.tournament.id} value={g.tournament.id}>
              {g.tournament.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {/* GROUPS */}
      {filteredGroups.length === 0 ? (
        <p className="admin-empty">No registrations match your filters.</p>
      ) : (
        <div className="reg-groups">
          {filteredGroups.map((g) => {
            const isOpen = !!expanded[g.tournament.id];
            return (
              <section key={g.tournament.id} className="reg-group">
                <header
                  className="reg-group-header"
                  onClick={() => toggle(g.tournament.id)}
                >
                  <div className="reg-group-title">
                    <span className={`reg-caret ${isOpen ? "open" : ""}`}>▸</span>
                    <div>
                      <h2>{g.tournament.name}</h2>
                      <small>
                        {g.tournament.startTime
                          ? formatDate(g.tournament.startTime)
                          : "—"}{" "}
                        · Entry ₹{g.tournament.entry}
                      </small>
                    </div>
                  </div>

                  <div className="reg-group-stats">
                    <span className="stat-chip stat-total">
                      {g.registrations.length} shown
                    </span>
                    <span className="stat-chip stat-paid">
                      {g.stats.paid ?? 0} paid
                    </span>
                    <span className="stat-chip stat-pending">
                      {g.stats.pending ?? 0} pending
                    </span>
                    <span className="stat-chip stat-revenue">
                      ₹{g.stats.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                </header>

                {isOpen && (
                  <div className="reg-table-wrap">
                    <table className="reg-table">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Email</th>
                          <th>IGN</th>
                          <th>UID</th>
                          <th>Status</th>
                          <th>Amount</th>
                          <th>Registered</th>
                          <th>Paid At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.registrations.map((r) => (
                          <tr key={r.id}>
                            <td>
                              <strong>{r.user.name}</strong>
                            </td>
                            <td className="reg-muted">{r.user.email}</td>
                            <td>{r.ign}</td>
                            <td className="reg-mono">{r.uid}</td>
                            <td>
                              <span
                                className={`reg-badge reg-badge-${r.paymentStatus}`}
                              >
                                {r.paymentStatus}
                              </span>
                            </td>
                            <td>{r.amount === 0 ? "Free" : `₹${r.amount}`}</td>
                            <td className="reg-muted">
                              {formatDate(r.createdAt)}
                            </td>
                            <td className="reg-muted">
                              {r.paidAt ? formatDate(r.paidAt) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}