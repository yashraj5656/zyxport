// app/layout.js
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  title: "Zyxport Esports",
  description:
    "Competitive BGMI tournaments. Compete. Conquer. Become a champion.",
  icons: {
    icon: [
      { url: "/ZX.png", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/ZX.png",
  },
  manifest: "/site.webmanifest",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}