"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send message");
        return;
      }

      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="contact-success">
        <div className="contact-success-icon">✓</div>
        <h3>Message Received</h3>
        <p>
          Thanks for reaching out! We'll get back to you within 24 hours.
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={() => setSent(false)}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}

      <div className="contact-form-row">
        <label>
          Your Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={60}
            placeholder="Your full name"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label>
        Subject
        <select
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
        >
          <option value="">Select a topic...</option>
          <option value="tournament">Tournament Query</option>
          <option value="refund">Refund Request</option>
          <option value="technical">Technical Problem</option>
          <option value="partnership">Partnership / Sponsorship</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label>
        Message
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          rows={6}
          maxLength={1000}
          placeholder="Describe your issue or question in detail..."
        />
        <small className="char-count">{form.message.length}/1000</small>
      </label>

      <button
        type="submit"
        className="primary-button"
        disabled={sending}
        style={{ width: "100%" }}
      >
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}