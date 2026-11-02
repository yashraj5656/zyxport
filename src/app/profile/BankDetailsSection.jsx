"use client";

import { useState, useEffect } from "react";

export default function BankDetailsSection() {
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/bank");
      const data = await res.json();
      if (data.bank) {
        setBank(data.bank);
        setForm({
          accountHolderName: data.bank.accountHolderName || "",
          accountNumber: data.bank.accountNumber || "",
          ifscCode: data.bank.ifscCode || "",
          bankName: data.bank.bankName || "",
          upiId: data.bank.upiId || "",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile/bank", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Save failed");
      } else {
        setBank(data.bank);
        setSuccess("Bank details saved");
        setEditing(false);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading...</p>;

  return (
    <section className="profile-card">
      <div className="profile-bank-header">
        <h2>💳 Bank Details</h2>
        {bank && !editing && (
          <button
            type="button"
            className="profile-edit-toggle"
            onClick={() => setEditing(true)}
          >
            ✎ Edit
          </button>
        )}
      </div>

      <p className="profile-bank-note">
        Prize money will be sent to this account after you win a tournament.
        Make sure your details are accurate.
      </p>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      {!editing && bank ? (
        <div className="profile-bank-display">
          <div>
            <small>Account Holder</small>
            <strong>{bank.accountHolderName}</strong>
          </div>
          <div>
            <small>Account Number</small>
            <strong className="reg-mono">
              {bank.accountNumber.replace(/\d(?=\d{4})/g, "*")}
            </strong>
          </div>
          <div>
            <small>IFSC Code</small>
            <strong className="reg-mono">{bank.ifscCode}</strong>
          </div>
          <div>
            <small>Bank Name</small>
            <strong>{bank.bankName}</strong>
          </div>
          {bank.upiId && (
            <div>
              <small>UPI ID</small>
              <strong>{bank.upiId}</strong>
            </div>
          )}
        </div>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Account Holder Name
            <input
              type="text"
              value={form.accountHolderName}
              onChange={(e) =>
                setForm({ ...form, accountHolderName: e.target.value })
              }
              required
            />
          </label>

          <label>
            Account Number
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
              required
              pattern="[0-9]{9,18}"
              title="9-18 digits"
            />
          </label>

          <label>
            IFSC Code
            <input
              type="text"
              value={form.ifscCode}
              onChange={(e) =>
                setForm({ ...form, ifscCode: e.target.value.toUpperCase() })
              }
              required
              maxLength={11}
              placeholder="e.g. HDFC0001234"
            />
          </label>

          <label>
            Bank Name
            <input
              type="text"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              required
              placeholder="e.g. HDFC Bank"
            />
          </label>

          <label>
            UPI ID (optional)
            <input
              type="text"
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              placeholder="e.g. yourname@paytm"
            />
          </label>

          <div className="profile-form-actions">
            {bank && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Bank Details"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}