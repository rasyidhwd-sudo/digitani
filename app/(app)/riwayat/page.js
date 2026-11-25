import Link from 'next/link';
import { listConversations } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { fmt } from '@/lib/format';
const CATS = ['Hama dan Penyakit', 'Tanaman Pangan', 'Hortikultura', 'Pemupukan', 'Irigasi', 'Kesehatan Tanah'];
export default async function Riwayat({ searchParams }) {
  const user = await getUser();
  const q = (searchParams.q || '').toLowerCase(), cat = searchParams.cat || '';
  const all = await listConversations(user.id);
  const list = all.filter((c) => (!cat || c.category === cat) && c.title.toLowerCase().includes(q));
  const href = (c) => `/riwayat?cat=${encodeURIComponent(c)}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ''}`;
  return (
    <div>
      <h1 className="text-2xl font-bold">Riwayat Konsultasi</h1>
      <p className="text-stone mb-3">Buka kembali percakapan sebelumnya.</p>
      <form className="mb-3"><input className="inp" name="q" defaultValue={searchParams.q || ''} placeholder="Cari pertanyaan, lalu tekan Enter…" />{cat && <input type="hidden" name="cat" value={cat} />}</form>
      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="/riwayat" className={`chip ${!cat ? 'chip-on' : ''}`}>Semua</Link>
        {CATS.map((c) => <Link key={c} href={href(c)} className={`chip ${cat === c ? 'chip-on' : ''}`}>{c}</Link>)}
      </div>
      <div className="card">
        {list.length ? list.map((c) => {
          const kb = c.messages.length;
          return (
            <Link key={c.id} href={`/konsultasi?c=${c.id}`} className="flex justify-between gap-3 py-3 border-b border-line last:border-0 hover:bg-cream">
              <div><b className="text-sm">{c.title}</b><div className="text-xs text-stone">{fmt(c.date)} · {c.category} · {kb} pesan</div></div>
              <span className="tag h-fit">{c.status}</span>
            </Link>
          );
        }) : <p className="text-center text-stone py-8">Belum ada konsultasi yang cocok. Coba kata kunci atau kategori lain.</p>}
      </div>
    </div>
  );
}
