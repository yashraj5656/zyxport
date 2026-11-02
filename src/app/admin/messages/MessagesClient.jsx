"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MessagesClient() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/messages");
    const data = await res.json();
    if (res.ok) setMessages(data.messages || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markStatus(id, status) {
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    load();
  }

  const filtered =
    filter === "all" ? messages : messages.filter((m) => m.status === filter);

  return (
    <>
      <div className="admin-reg-header">
        <div>
          <Link href="/admin" className="admin-back">
            ← Back to tournaments
          </Link>
          <h1 className="admin-title">Contact Messages</h1>
          <p className="admin-subtitle-line">
            Inbox from the /contact form ({messages.length} total)
          </p>
        </div>
      </div>

      <div className="reg-filters" style={{ gridTemplateColumns: "auto" }}>
        <select
          className="reg-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All messages</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {loading ? (
        <p className="admin-loading">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="admin-empty">No messages in this filter.</p>
      ) : (
        <div className="admin-winners-list">
          {filtered.map((m) => (
            <div key={m.id} className="winner-card">
              <div className="winner-card-head">
                <div>
                  <h3>
                    {m.subject} — {m.name}
                  </h3>
                  <small>
                    {m.email} ·{" "}
                    {new Date(m.createdAt).toLocaleString("en-IN")}
                  </small>
                </div>
                <div className="winner-actions">
                  <span
                    className={`reg-badge reg-badge-${
                      m.status === "new"
                        ? "pending"
                        : m.status === "replied"
                        ? "paid"
                        : "refunded"
                    }`}
                  >
                    {m.status}
                  </span>
                  <a
                    href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(
                      m.subject
                    )}`}
                    className="winner-pay-btn"
                    onClick={() => markStatus(m.id, "replied")}
                  >
                    Reply
                  </a>
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={() => remove(m.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p
                style={{
                  color: "#c8d0cb",
                  fontSize: 13,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  padding: "4px 0 0",
                }}
              >
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}