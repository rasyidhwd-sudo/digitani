import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { read } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { fmt } from '@/lib/format';
export default async function Dashboard() {
  const user = await getUser();
  const mine = (await read('conversations')).filter((c) => c.userId === user.id);
  const kb = await read('knowledge');
  const now = new Date();
  const thisMonth = mine.filter((c) => { const d = new Date(c.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
  const tally = {}; mine.forEach((c) => (tally[c.category] = (tally[c.category] || 0) + 1));
  const topCat = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const stats = [[mine.length, 'Total konsultasi'], [thisMonth, 'Konsultasi bulan ini'], [mine[0]?.title || '-', 'Pertanyaan terakhir'], [topCat, 'Topik paling sering']];
  return (
    <div>
      <div className="flex flex-wrap justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Selamat datang kembali, {user.name.split(' ')[0]}!</h1><p className="text-stone">Berikut ringkasan aktivitas konsultasi Anda.</p></div>
        <Link href="/konsultasi" className="btn"><MessageCircle size={18} /> Mulai Konsultasi</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {stats.map(([v, l]) => <div key={l} className="card"><b className={`block text-sage ${String(v).length > 4 ? 'text-base' : 'text-3xl'}`}>{v}</b><span className="text-sm text-stone">{l}</span></div>)}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-2">Riwayat terbaru</h2>
          {mine.length ? mine.slice(0, 3).map((c) => (
            <Link key={c.id} href={`/konsultasi?c=${c.id}`} className="flex justify-between gap-3 py-3 border-b border-line last:border-0 hover:bg-cream">
              <div><b className="text-sm">{c.title}</b><div className="text-xs text-stone">{fmt(c.date)} · {c.category}</div></div>
              <span className="tag h-fit">{c.status}</span>
            </Link>
          )) : <p className="text-sm text-stone">Belum ada konsultasi. Mulai pertanyaan pertama Anda.</p>}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-2">Topik yang disarankan</h2>
          <div className="flex flex-wrap gap-2 mb-4">{['Daun padi menguning', 'Hama cabai', 'Pemupukan jagung', 'Jadwal irigasi'].map((t) => <Link key={t} className="chip" href={`/konsultasi?q=${encodeURIComponent(t)}`}>{t}</Link>)}</div>
          <h2 className="font-semibold mb-1">Artikel pengetahuan</h2>
          {kb.slice(0, 3).map((a) => <Link key={a.id} href={`/pengetahuan/${a.id}`} className="flex justify-between gap-2 py-2 text-sm border-b border-line last:border-0 hover:bg-cream"><b>{a.title}</b><span className="tag h-fit whitespace-nowrap">{a.category}</span></Link>)}
        </div>
      </div>
    </div>
  );
}
