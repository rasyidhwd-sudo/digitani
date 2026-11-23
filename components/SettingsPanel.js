'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function SettingsPanel({ role }) {
  const r = useRouter();
  const [big, setBig] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { setBig(localStorage.getItem('dt-size') === 'besar'); }, []);
  function toggle(v) { setBig(v); localStorage.setItem('dt-size', v ? 'besar' : 'normal'); document.documentElement.style.fontSize = v ? '18px' : ''; }
  async function hapus() {
    if (!confirm('Hapus semua riwayat percakapan AI Anda? Tindakan ini tidak bisa dibatalkan.')) return;
    const res = await fetch('/api/conversations', { method: 'DELETE' });
    setMsg(res.ok ? 'Riwayat percakapan sudah dihapus.' : 'Gagal menghapus riwayat.'); r.refresh();
  }
  return (
    <div className="space-y-4 max-w-xl">
      <div className="card"><h2 className="font-semibold mb-2">Tampilan</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={big} onChange={(e) => toggle(e.target.checked)} /> Teks lebih besar (memudahkan membaca)</label></div>
      {role === 'petani' && (
        <div className="card"><h2 className="font-semibold mb-1">Data percakapan</h2>
          <p className="text-sm text-stone mb-3">Menghapus riwayat percakapan dengan AI Konsultasi. Pertanyaan ke Pakar tidak ikut terhapus.</p>
          <button className="btn2" onClick={hapus}>Hapus riwayat percakapan AI</button>
          {msg && <p className="text-sm text-sage mt-2">{msg}</p>}</div>
      )}
    </div>
  );
}
