// app/tournaments/[id]/ShareButton.jsx
"use client";

import { useState } from "react";

export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    // Check if the browser supports native sharing (mostly mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} — ZYXPORT`,
          text: `Join me for the ${title} tournament on ZYXPORT!`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard copy for desktop browsers
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
      className="share-btn"
      aria-label="Share Tournament"
    >
      {copied ? (
        <>✓ Copied!</>
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}