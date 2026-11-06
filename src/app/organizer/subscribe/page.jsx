// app/organizer/subscribe/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe() {
    setLoading(true);
    setError("");

    try {
      // 1. Create order
      const res = await fetch("/api/organizer/subscribe", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // 2. Load Razorpay script
      await loadRazorpayScript();

      // 3. Open Checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "ZYXPORT",
        description: "Organizer Monthly Subscription (30 Days)",
        order_id: data.orderId,
        handler: async (response) => {
          // 4. Verify Payment
          const verifyRes = await fetch("/api/organizer/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            router.push("/organizer"); // Success, go to dashboard
            router.refresh();
          } else {
            setError("Payment verification failed.");
          }
        },
        theme: { color: "#b5ff36" },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="org-page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 400, width: "100%", background: "var(--surface)", padding: 40, borderRadius: 12, border: "1px solid var(--border)", textAlign: "center" }}>
        <span className="eyebrow" style={{ color: "var(--green)" }}>MEMBERSHIP REQUIRED</span>
        <h1 style={{ fontFamily: "Barlow Condensed", fontSize: 36, fontWeight: 900, margin: "16px 0" }}>
          UNLOCK ORGANIZER ACCESS
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Host unlimited BGMI tournaments, manage players, and distribute room IDs automatically.
        </p>
        
        <div style={{ background: "#0b0f0e", padding: 20, borderRadius: 8, marginBottom: 24 }}>
          <strong style={{ fontFamily: "Barlow Condensed", fontSize: 48, color: "var(--green)" }}>₹799</strong>
          <span style={{ color: "var(--muted)" }}> / month</span>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        <button onClick={handleSubscribe} className="primary-button" style={{ width: "100%", padding: 16 }} disabled={loading}>
          {loading ? "Opening Razorpay..." : "Subscribe Now"}
        </button>

        <Link href="/" style={{ display: "block", marginTop: 16, fontSize: 12, color: "var(--muted)" }}>
          ← Back to home
        </Link>
      </div>
    </main>
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