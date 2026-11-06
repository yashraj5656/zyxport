// app/organizers/SubscribeButton.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscribeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/organizer/subscribe", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Could not create order");

      await loadRazorpayScript();

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "ZYXPORT",
        description: "Organizer Monthly Subscription",
        order_id: data.orderId,
        handler: async (response) => {
          const verifyRes = await fetch("/api/organizer/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            // Success! Force a hard reload to update the server layout
            window.location.href = "/organizer"; 
          } else {
            setError("Payment verification failed.");
            setLoading(false);
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
    <div style={{ width: "100%" }}>
      {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
      <button 
        onClick={handleSubscribe} 
        className="primary-button" 
        style={{ width: "100%", padding: "16px", fontSize: "14px" }} 
        disabled={loading}
      >
        {loading ? "Opening Razorpay..." : "Subscribe Now for ₹799 →"}
      </button>
    </div>
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