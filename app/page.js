import Link from 'next/link';
import { Leaf, MessageCircle, BookOpen, Search, Clock } from 'lucide-react';
import { read } from '@/lib/db';
const CATS = ['Hama dan Penyakit', 'Tanaman Pangan', 'Hortikultura', 'Pemupukan', 'Irigasi', 'Kesehatan Tanah'];
const FEAT = [[MessageCircle, 'AI Agriculture Assistant', 'Tanya apa saja dan dapatkan jawaban terstruktur.'], [BookOpen, 'Basis Pengetahuan Pertanian', 'Rencana: buku, jurnal, dan panduan tepercaya.'], [Search, 'Referensi Ilmiah', 'Setiap jawaban disertai sumber yang bisa ditelusuri.'], [Clock, 'Riwayat Konsultasi', 'Buka kembali pertanyaan dan jawaban sebelumnya.']];
const STEPS = ['Petani mengirim pertanyaan', 'AI mencari pengetahuan pertanian yang relevan', 'AI menyusun jawaban beserta referensi', 'Petani meninjau jawaban dan sumbernya'];
export const dynamic = 'force-dynamic';
export default async function Landing() {
  const kb = await read('knowledge');
  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-line">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-sage"><span className="grid place-items-center w-8 h-8 rounded-xl bg-sage text-white"><Leaf size={18} /></span>DigiTani</Link>
          <nav className="ml-auto flex items-center gap-5 text-sm font-semibold">
            <a href="#tentang" className="hidden md:block">Tentang Kami</a>
            <a href="#fitur" className="hidden md:block">Fitur</a>
            <Link href="/pengetahuan" className="hidden md:block">Pengetahuan Pertanian</Link>
            <Link href="/login">Login</Link>
            <Link href="/daftar" className="hidden md:block">Daftar</Link>
            <Link href="/konsultasi" className="btn">Mulai Bertanya</Link>
          </nav>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-5 py-14 grid md:grid-cols-[1.1fr_.9fr] gap-8 items-center">
        <div>
          <span className="tag">Prototipe · Growing Together, Growing Smarter</span>
          <h1 className="text-4xl md:text-5xl font-bold text-sage leading-tight mt-3">Temukan Solusi Pertanian Bersama AI.</h1>
          <p className="text-stone text-lg mt-3">Dapatkan informasi dan rekomendasi pertanian melalui asisten cerdas yang didukung pengetahuan dari berbagai sumber ilmiah.</p>
          <div className="flex gap-3 mt-6"><Link href="/konsultasi" className="btn">Mulai Konsultasi</Link><a href="#tentang" className="btn2">Pelajari DigiTani</a></div>
        </div>
        <div className="card bg-soft border-0 p-6">
          <div className="bg-sage text-white rounded-2xl rounded-br-sm p-3 text-sm ml-10">Mengapa daun padi saya menguning?</div>
          <div className="bg-white rounded-2xl rounded-bl-sm p-3 text-sm mt-3 mr-6"><b className="text-teal text-xs">DigiTani AI</b><p className="mt-1">Ada beberapa kemungkinan: kekurangan hara, pengelolaan air, atau penyakit. Berikut langkah pengamatan awalnya…</p><span className="tag mt-2">Contoh ilustratif</span></div>
        </div>
      </section>
      <section id="fitur" className="max-w-6xl mx-auto px-5 py-10">
        <h2 className="text-2xl font-bold">Fitur DigiTani</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">{FEAT.map(([I, t, d]) => <div key={t} className="card"><div className="w-11 h-11 rounded-xl bg-soft text-sage grid place-items-center mb-2"><I size={22} /></div><h3 className="font-semibold">{t}</h3><p className="text-sm text-stone">{d}</p></div>)}</div>
      </section>
      <section id="tentang" className="bg-soft py-10">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold">Cara Kerjanya</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">{STEPS.map((s, i) => <div key={s} className="card"><b className="grid place-items-center w-8 h-8 rounded-full bg-sage text-white mb-2">{i + 1}</b><p className="text-sm">{s}.</p></div>)}</div>
          <p className="text-sm text-stone mt-4">Catatan: ini prototipe. Jawaban AI dan referensi di dalamnya disimulasikan dengan data contoh.</p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-5 py-10">
        <h2 className="text-2xl font-bold">Topik Pengetahuan</h2>
        <div className="flex flex-wrap gap-2 mt-4">{CATS.map((c) => <Link key={c} href={`/pengetahuan?cat=${encodeURIComponent(c)}`} className="chip">{c} ({kb.filter((k) => k.category === c).length})</Link>)}</div>
      </section>
      <footer className="bg-sage text-white/90 py-8 text-sm">
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-3 gap-6">
          <div><b className="text-lg text-white">DigiTani</b><p>Growing Together, Growing Smarter.</p></div>
          <div><b className="text-white">Navigasi</b><p>Fitur · Tentang Kami · Pengetahuan Pertanian</p></div>
          <div><b className="text-white">Tentang proyek</b><p>Prototipe proyek perkuliahan yang berkaitan dengan IPB DigiTani. Bukan produk resmi dan belum didukung pihak mana pun.</p></div>
        </div>
      </footer>
    </>
  );
}
