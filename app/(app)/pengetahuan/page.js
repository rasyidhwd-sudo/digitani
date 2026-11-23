import Link from 'next/link';
import { read } from '@/lib/db';
const CATS = ['Hama dan Penyakit', 'Tanaman Pangan', 'Hortikultura', 'Pemupukan', 'Irigasi', 'Kesehatan Tanah'];
export default async function Pengetahuan({ searchParams }) {
  const q = (searchParams.q || '').toLowerCase(), cat = searchParams.cat || '';
  const list = (await read('knowledge')).filter((a) => (!cat || a.category === cat) && (a.title + a.summary).toLowerCase().includes(q));
  return (
    <div>
      <h1 className="text-2xl font-bold">Pusat Pengetahuan Pertanian</h1>
      <p className="text-stone mb-3">Artikel di sini adalah konten ilustratif untuk prototipe, bukan hasil indeks dokumen asli.</p>
      <form className="mb-3"><input className="inp" name="q" defaultValue={searchParams.q || ''} placeholder="Cari pengetahuan pertanian, lalu tekan Enter…" />{cat && <input type="hidden" name="cat" value={cat} />}</form>
      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="/pengetahuan" className={`chip ${!cat ? 'chip-on' : ''}`}>Semua</Link>
        {CATS.map((c) => <Link key={c} href={`/pengetahuan?cat=${encodeURIComponent(c)}`} className={`chip ${cat === c ? 'chip-on' : ''}`}>{c}</Link>)}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.length ? list.map((a) => (
          <Link key={a.id} href={`/pengetahuan/${a.id}`} className="card hover:border-leaf"><span className="tag">{a.category}</span><h2 className="font-semibold mt-2">{a.title}</h2><p className="text-sm text-stone">{a.summary.slice(0, 100)}…</p></Link>
        )) : <p className="text-stone">Tidak ada artikel yang cocok dengan pencarian Anda.</p>}
      </div>
    </div>
  );
}
