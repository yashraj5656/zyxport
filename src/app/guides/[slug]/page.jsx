// app/guides/[slug]/page.jsx
import { getGuideBySlug, guides } from "@/lib/guidesData";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../guides.css"; // Reusing the same CSS file

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  
  if (!guide) return { title: "Article Not Found" };
  
  return {
    title: `${guide.title} — ZYXPORT`,
    description: guide.excerpt,
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  // Get up to 3 related articles (excluding the current one)
  const related = guides.filter((g) => g.slug !== slug).slice(0, 3);

  return (
    <main className="article-page">
      <div className="article-container">
        {/* Back Button */}
        <Link href="/guides" className="article-back">
          ← Back to all guides
        </Link>

        {/* Article Header */}
        <header className="article-header">
          <span className="eyebrow">{guide.category}</span>
          <h1>{guide.title}</h1>
          <div className="article-meta">
            <span>Published: {guide.date}</span>
            <span>•</span>
            <span>{guide.readTime}</span>
          </div>
        </header>

        {/* Article Content (rendered from HTML string) */}
        <article 
          className="article-content" 
          dangerouslySetInnerHTML={{ __html: guide.content }} 
        />

        {/* Related Articles Footer */}
        <div className="article-divider" />
        <section className="related-articles">
          <h2>Keep Reading</h2>
          <div className="related-grid">
            {related.map((r) => (
              <Link href={`/guides/${r.slug}`} key={r.slug} className="related-card">
                <span>{r.category}</span>
                <h3>{r.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}