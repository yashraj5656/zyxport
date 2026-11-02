"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PayPage() {
  const { id } = useParams();
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setPaying(true);
    setError("");

    try {
      // 1. Create Razorpay order on server
      const orderRes = await fetch(`/api/tournaments/${id}/pay`, {
        method: "POST",
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error || "Could not create order");
        setPaying(false);
        return;
      }

      // 2. Load Razorpay Checkout script (once)
      await loadRazorpayScript();

      // 3. Open Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Zyxport Esports",
        description: "Tournament Entry",
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              `/api/tournaments/${id}/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }
            );

            if (!verifyRes.ok) {
              const data = await verifyRes.json();
              setError(data.error || "Payment verification failed");
              setPaying(false);
              return;
            }

            router.push(`/tournaments/${id}?paid=1`);
            router.refresh();
          } catch {
            setError("Verification error");
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
        theme: { color: "#b5ff36" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      setPaying(false);
    }
  }

  return (
    <main className="section" style={{ minHeight: "60vh" }}>
      <div
        className="section-container"
        style={{ maxWidth: 480, margin: "auto" }}
      >
        <div className="detail-card">
          <h2>Complete Payment</h2>
          <p className="detail-sub">
          The Room ID and password will be unlocked on the tournament
    page after payment. Do not share them with anyone — sharing will
    result in disqualification.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="button"
            className="primary-button"
            onClick={handlePay}
            disabled={paying}
            style={{ width: "100%" }}
          >
            {paying ? "Opening Razorpay..." : "Pay Now"}
          </button>

          <Link href={`/tournaments/${id}`} className="pay-cancel">
            Cancel
          </Link>
        </div>
      </div>
    </main>
  );
}

// Load the Razorpay script once, then resolve
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}