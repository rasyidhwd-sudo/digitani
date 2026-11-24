'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Plus } from 'lucide-react';
import AnswerCard from './AnswerCard';
const SUG = ['Mengapa daun padi saya menguning?', 'Bagaimana cara mengatasi hama pada tanaman cabai?', 'Apa rekomendasi pemupukan untuk jagung?', 'Bagaimana menentukan jadwal irigasi yang tepat?'];
export default function Chat({ conversationId, initial, autoSend, status }) {
  const [msgs, setMsgs] = useState(initial);
  const [cid, setCid] = useState(conversationId);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [txt, setTxt] = useState('');
  const end = useRef(null), sent = useRef(false);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);
  async function send(m) {
    m = (m ?? txt).trim();
    if (!m || busy) return;
    setTxt(''); setErr(null); setBusy(true);
    setMsgs((x) => [...x, { role: 'user', text: m }]);
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: cid, message: m, history: msgs.slice(-6).map((x) => (x.role === 'user' ? { role: 'user', text: x.text } : { role: 'ai', summary: x.summary, topic: x.topic })) }) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setCid(d.conversationId); setMsgs((x) => [...x, d.message]);
    } catch { setErr(m); } finally { setBusy(false); }
  }
  useEffect(() => { if (autoSend && !sent.current) { sent.current = true; send(autoSend); } }, []); // eslint-disable-line
  const retry = () => { const m = err; setMsgs((x) => x.slice(0, -1)); send(m); };
  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] md:h-[calc(100vh-4rem)]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div><h1 className="text-2xl font-bold">DigiTani AI Assistant</h1><p className="text-stone text-sm">Asisten cerdas untuk membantu kebutuhan pertanian Anda.</p>{status && <p className="text-xs text-stone mt-0.5"><span className="tag mr-2">{status.mode === 'llm' ? `Mode: ${status.model}` : 'Mode: simulasi'}</span>{status.detail}</p>}</div>
        <button className="btn2" onClick={() => (window.location.href = '/konsultasi')}><Plus size={16} /> Percakapan baru</button>
      </div>
      <div className="flex-1 min-h-0 bg-white border border-line rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="bg-aibg rounded-2xl rounded-bl-sm p-3 max-w-[760px] self-start text-sm">Halo! Saya DigiTani AI. Ada yang ingin Anda tanyakan seputar pertanian hari ini?</div>
          {!msgs.length && <div className="grid sm:grid-cols-2 gap-3">{SUG.map((s) => <button key={s} className="card text-left text-sm hover:border-teal" onClick={() => send(s)}>{s}</button>)}</div>}
          {msgs.map((m, i) => m.role === 'user'
            ? <div key={i} className="bg-sage text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%] self-end text-sm">{m.text}</div>
            : <AnswerCard key={i} a={m} />)}
          {busy && <div className="bg-aibg rounded-2xl px-4 py-3 self-start text-sm animate-pulse">{status?.mode === 'llm' ? 'Model lokal sedang menyusun jawaban. Di laptop tanpa GPU ini bisa memakan waktu setengah menit atau lebih…' : 'DigiTani AI sedang menyusun jawaban…'}</div>}
          {err && <div className="border border-earth bg-earth/10 rounded-2xl p-3 self-start text-sm">Koneksi terputus. Pertanyaan belum terkirim. <button className="btn2 ml-2" onClick={retry}>Coba lagi</button></div>}
          <div ref={end} />
        </div>
        <div className="flex gap-2 p-3 border-t border-line">
          <input className="inp" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Tulis pertanyaan Anda di sini…" />
          <button className="btn" onClick={() => send()} disabled={busy} aria-label="Kirim"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
