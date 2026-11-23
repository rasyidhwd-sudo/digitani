'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Clock, BookOpen, User, Leaf, Settings } from 'lucide-react';
const L = [['/dashboard', 'Dashboard', Home], ['/konsultasi', 'AI Konsultasi', MessageCircle], ['/riwayat', 'Riwayat Konsultasi', Clock], ['/pengetahuan', 'Pengetahuan Pertanian', BookOpen], ['/profil', 'Profil Saya', User], ['/pengaturan', 'Pengaturan', Settings]];
export default function Sidebar({ user }) {
  const p = usePathname();
  return (
    <>
      <aside className="hidden md:flex flex-col gap-1 bg-sage text-white p-4 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4 px-2"><Leaf size={20} />DigiTani</Link>
        {L.map(([h, t, I]) => (
          <Link key={h} href={h} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${p.startsWith(h) ? 'bg-white/20' : 'hover:bg-white/10'}`}><I size={18} />{t}</Link>
        ))}
        <div className="mt-auto text-xs opacity-80 px-2">Masuk sebagai {user.name}</div>
      </aside>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-sage text-white flex justify-around py-2 z-20">
        {L.map(([h, t, I]) => (
          <Link key={h} href={h} className={`flex flex-col items-center text-[10px] gap-0.5 px-2 py-1 rounded-lg ${p.startsWith(h) ? 'bg-white/20' : ''}`}><I size={20} />{t.split(' ')[0]}</Link>
        ))}
      </nav>
    </>
  );
}
