import Link from "next/link";
import SurahSearch from "@/components/SurahSearch";
import { appendixPages, siteTitle, surahs, translator } from "@/lib/data";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">Translator</div>
        <h1>{siteTitle}</h1>
        <p className="translator-name">{translator}</p>
        <p className="hero-copy">
          A clear, faithful and modern presentation of the full manuscript, arranged for online
          reading. Each surah opens with Arabic first, then the English translation.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/surah/1">
            Start reading
          </Link>
          <Link className="button button-secondary" href="/appendices/introduction">
            Read introduction
          </Link>
        </div>
      </section>

      <section className="stats-strip">
        <div>
          <strong>114</strong>
          <span>surahs</span>
        </div>
        <div>
          <strong>6,236</strong>
          <span>verses</span>
        </div>
        <div>
          <strong>Arabic + English</strong>
          <span>reading layout</span>
        </div>
      </section>

      <SurahSearch surahs={surahs} />

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Manuscript sections</h2>
            <p>Front matter and back matter prepared as readable website sections.</p>
          </div>
        </div>

        <div className="appendix-grid">
          {appendixPages.map((item) => (
            <Link className="appendix-card" href={`/appendices/${item.slug}`} key={item.slug}>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}