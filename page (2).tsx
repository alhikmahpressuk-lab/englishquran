import Link from "next/link";
import { notFound } from "next/navigation";
import ArabicVerses from "@/components/ArabicVerses";
import { getSurah, surahs } from "@/lib/data";

type SurahPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return surahs.map((surah) => ({ id: String(surah.number) }));
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { id } = await params;
  const surah = getSurah(Number(id));

  if (!surah) {
    notFound();
  }

  const previous = surahs.find((item) => item.number === surah.number - 1) ?? null;
  const next = surahs.find((item) => item.number === surah.number + 1) ?? null;

  return (
    <main className="page-shell reading-page">
      <nav className="crumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Surah {surah.number}</span>
      </nav>

      <header className="reading-header">
        <div className="eyebrow">Translated by {surah.number === 1 ? "A. K. Khan" : "A. K. Khan"}</div>
        <h1>
          Surah {surah.name}
        </h1>
        <p>{surah.verseCount} verses</p>
      </header>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Arabic</h2>
            <p>Arabic text is loaded from a public Qur’an text endpoint in the reader.</p>
          </div>
        </div>
        <ArabicVerses surahNumber={surah.number} />
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>English translation</h2>
            <p>The English text below is sourced from the manuscript data used for this site.</p>
          </div>
        </div>

        {surah.basmala && surah.number !== 1 ? (
          <div className="basmala">{surah.basmala}</div>
        ) : null}

        <div className="english-stack">
          {surah.verses.map((verse) => (
            <article className="ayah-card" id={`ayah-${verse.number}`} key={verse.number}>
              <div className="ayah-meta">{verse.number}</div>
              <p>{verse.english}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="pager">
        {previous ? (
          <Link className="button button-secondary" href={`/surah/${previous.number}`}>
            ← {previous.name}
          </Link>
        ) : <span />}

        {next ? (
          <Link className="button" href={`/surah/${next.number}`}>
            {next.name} →
          </Link>
        ) : null}
      </div>
    </main>
  );
}