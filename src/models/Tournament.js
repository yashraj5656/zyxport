// models/Tournament.js
import mongoose from "mongoose";

const SponsorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    tagline: { type: String, default: "", trim: true, maxlength: 60 },
    href: { type: String, default: "#", trim: true },
    logo: { type: String, default: "🎯", trim: true, maxlength: 500 },
    tier: {
      type: String,
      enum: ["title", "gold", "community"],
      default: "gold",
    },
  },
  { _id: false }
);

// 👇 NEW: every editable text block on the page
const PageContentSchema = new mongoose.Schema(
  {
    // Brand
    brandName: { type: String, default: "APEX ARENA", trim: true },
    brandTagline: {
      type: String,
      default: "WHERE LEGENDS ARE FORGED",
      trim: true,
    },
    brandSubTagline: {
      type: String,
      default:
        "The official competitive circuit for BGMI. Every match, a proving ground.",
      trim: true,
    },
    brandWebsite: { type: String, default: "apexarena.gg", trim: true },

    // Brand CTA section
    ctaEyebrow: {
      type: String,
      default: "BECOME PART OF THE CIRCUIT",
      trim: true,
    },
    ctaTitleLine1: { type: String, default: "MORE THAN A", trim: true },
    ctaTitleLine2: {
      type: String,
      default: "TOURNAMENT PLATFORM.",
      trim: true,
    },
    ctaSubtitle: {
      type: String,
      default:
        "Apex Arena is a full esports ecosystem — weekly tournaments, ranked ladders, creator showcases, and a growing roster of partners who back the next generation of Indian gaming talent.",
      trim: true,
    },
    ctaPrimaryLabel: {
      type: String,
      default: "JOIN THE CIRCUIT",
      trim: true,
    },
    ctaPrimaryHref: { type: String, default: "/signup", trim: true },
    ctaSecondaryLabel: {
      type: String,
      default: "EXPLORE ALL TOURNAMENTS",
      trim: true,
    },
    ctaSecondaryHref: { type: String, default: "/tournaments", trim: true },
    ctaHighlight1Value: { type: String, default: "24/7", trim: true },
    ctaHighlight1Label: { type: String, default: "Competition", trim: true },
    ctaHighlight2Value: { type: String, default: "100%", trim: true },
    ctaHighlight2Label: { type: String, default: "Free Entry", trim: true },
    ctaHighlight3Value: { type: String, default: "48H", trim: true },
    ctaHighlight3Label: { type: String, default: "Prize Payouts", trim: true },
    ctaHighlight4Value: { type: String, default: "BGMI", trim: true },
    ctaHighlight4Label: { type: String, default: "Battle Ready", trim: true },

    // Sponsor wall
    sponsorWallEyebrow: {
      type: String,
      default: "THE CIRCUIT IS POWERED BY",
      trim: true,
    },
    sponsorWallTitle: {
      type: String,
      default: "BACKED BY THE BEST.",
      trim: true,
    },
    sponsorWallSubtitle: {
      type: String,
      default:
        "Apex Arena is made possible by partners who believe in the future of Indian mobile esports.",
      trim: true,
    },
    sponsorWallEmptyText: {
      type: String,
      default:
        "Sponsor slots are open for this tournament. Contact us if you'd like to partner with Apex Arena.",
      trim: true,
    },

    // Register section
    registerEyebrow: {
      type: String,
      default: "YOUR MOMENT STARTS HERE",
      trim: true,
    },
    registerTitle: {
      type: String,
      default: "CLAIM YOUR PLACE.",
      trim: true,
    },
    registerSubtitle: {
      type: String,
      default: "Free to enter. Real prizes. Real competition.",
      trim: true,
    },

    // Footer
    footerTaglineLine1: {
      type: String,
      default: "Every match. Every kill. Every victory.",
      trim: true,
    },
    footerTaglineLine2: {
      type: String,
      default: "WHERE LEGENDS ARE FORGED",
      trim: true,
    },
    footerBackLabel: {
      type: String,
      default: "← Back to all tournaments",
      trim: true,
    },
  },
  { _id: false }
);

const TournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    mode: {
      type: String,
      required: true,
      enum: ["SQUAD TPP", "SOLO TPP", "DUO TPP", "SQUAD FPP", "SOLO FPP"],
    },
    map: {
      type: String,
      required: true,
      enum: ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik"],
    },
    entry: { type: Number, default: 0, min: 0 },
    prize: { type: Number, required: true, min: 0 },
    slots: { type: Number, required: true, min: 1, default: 100 },
    filled: { type: Number, default: 0, min: 0 },
    date: { type: String, required: true },
    startTime: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        "Open",
        "Filling Fast",
        "Almost Full",
        "Full",
        "Completed",
        "Cancelled",
      ],
      default: "Open",
    },
    color: {
      type: String,
      enum: ["green", "purple", "orange"],
      default: "green",
    },
    roomId: { type: String, default: "", trim: true },
    roomPassword: { type: String, default: "", trim: true },

    sponsors: { type: [SponsorSchema], default: [] },
    pageContent: { type: PageContentSchema, default: () => ({}) },   // 👈 new
    bannerImage: { type: String, default: "", trim: true }, 
  },
  { timestamps: true }
);

export default mongoose.models.Tournament ||
  mongoose.model("Tournament", TournamentSchema);