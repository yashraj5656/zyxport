// app/guides/page.jsx
import { guides } from "@/lib/guidesData";
import GuideCard from "@/components/GuideCard";
import "./guides.css";

export const metadata = {
  title: "Guides & News — ZYXPORT",
  description: "Learn BGMI tips, read tournament rules, and stay updated with ZYXPORT news.",
};

export default function GuidesPage() {
  return (
    <main className="guides-page">
      <div className="guides-container">
        <header className="guides-header">
          <span className="eyebrow">LEARN & DOMINATE</span>
          <h1>
            ZYXPORT <span>GUIDES</span>
          </h1>
          <p>
            Everything you need to know about competing, improving your gameplay, 
            and staying updated with the ZYXPORT community.
          </p>
        </header>

        <div className="guides-grid">
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </div>
    </main>
  );
}