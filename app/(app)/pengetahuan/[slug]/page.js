import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getKnowledge } from '@/lib/db';
export default async function Artikel({ params }) {
  const a = (await getKnowledge()).find((x) => x.id === params.slug);
  if (!a) notFound();
  return (
    <article className="max-w-2xl">
      <Link href="/pengetahuan" className="text-sm text-sage font-semibold">← Kembali ke pusat pengetahuan</Link>
      <span className="tag block w-fit mt-3">{a.category}</span>
      <h1 className="text-2xl font-bold mt-2">{a.title}</h1>
      <p className="mt-3">{a.summary}</p><p className="mt-2 text-stone">{a.body}</p>
      <h2 className="font-semibold mt-4">{a.label}</h2>
      <ul className="list-disc pl-5 text-sm">{a.points.map((p) => <li key={p}>{p}</li>)}</ul>
      <div className="card mt-4 text-sm"><b>Sumber</b> <span className="tag">Contoh ilustratif</span><ul className="list-disc pl-5 mt-1">{a.refs.map((r) => <li key={r}>{r}</li>)}</ul><p className="text-stone mt-2">Konten ini hanya contoh untuk prototipe dan belum berasal dari dokumen yang diindeks.</p></div>
      <Link href={`/konsultasi?q=${encodeURIComponent(a.title)}`} className="btn mt-4">Tanyakan ke AI tentang topik ini</Link>
    </article>
  );
}
