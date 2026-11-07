// app/organizer/ShareButton.jsx
"use client";

import { useState } from "react";

export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/tournaments/${title.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title.name} — ZYXPORT`,
          text: `Join me for the ${title.name} tournament on ZYXPORT!`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="admin-view-btn"
      title="Share Tournament Link"
    >
      {copied ? "✓ Copied" : "Share"}
    </button>
  );
}