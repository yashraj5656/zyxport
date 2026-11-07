// app/layout.js
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  // Basic Info
  metadataBase: new URL("https://zyxport.com"), // 👈 Hardcoded base URL
  title: {
    default: "Zyxport Esports — Free BGMI Tournaments",
    template: "%s | Zyxport Esports",
  },
  description:
    "Join the ultimate competitive BGMI tournament platform. Compete for real cash prizes, climb the leaderboard, and become a champion. 100% free entry.",

  // SEO Keywords
  keywords: [
    "BGMI tournaments",
    "Free BGMI tournaments",
    "BGMI esports",
    "Zyxport",
    "BGMI cash prizes",
    "Indian esports",
    "Mobile gaming tournaments",
    "BGMI scrims",
  ],

  // Author & Creator Info
  authors: [{ name: "Zyxport Team" }],
  creator: "Zyxport",
  publisher: "Zyxport Esports",

  // Icons
  icons: {
    icon: [
      { url: "/ZX.png", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/ZX.png",
  },
  manifest: "/site.webmanifest",

  // Rich Link Previews (WhatsApp, Discord, iMessage, Facebook)
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://zyxport.com",
    title: "Zyxport Esports — Free BGMI Tournaments",
    description:
      "Compete in free BGMI tournaments and win real cash prizes. Register for free, get room IDs, and dominate the leaderboard.",
    siteName: "Zyxport Esports",
    images: [
      {
        url: "/ZX.png", // Make sure this image exists in your public folder
        width: 1200,
        height: 630,
        alt: "Zyxport Esports BGMI Tournament",
      },
    ],
  },

  // Twitter/X Cards
  twitter: {
    card: "summary_large_image",
    title: "Zyxport Esports — Free BGMI Tournaments",
    description:
      "Compete in free BGMI tournaments and win real cash prizes. Join the arena now.",
    images: ["/og-image.jpg"],
    creator: "@zyxport",
  },

  // Robots (Allows Google to index the site)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1420011915320387"
     crossorigin="anonymous"></script>
</head>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}