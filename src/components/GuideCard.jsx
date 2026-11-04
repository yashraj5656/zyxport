// components/GuideCard.jsx
import Link from "next/link";

export default function GuideCard({ guide }) {
  return (
    <Link href={`/guides/${guide.slug}`} className="guide-card">
      <div className="guide-card-header">
        <span className="guide-category">{guide.category}</span>
      </div>
      <div className="guide-card-body">
        <h3>{guide.title}</h3>
        <p>{guide.excerpt}</p>
      </div>
      <div className="guide-card-footer">
        <span className="guide-date">{guide.date}</span>
        <span className="guide-read-time">{guide.readTime} →</span>
      </div>
    </Link>
  );
}