import { NextResponse } from 'next/server';
import { getConversation, saveConversation } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { retrieve, confidence, fromEntry, expand, GENERIC } from '@/lib/rag';
import { generate, llmEnabled, MODEL } from '@/lib/llm';
// Kontrak API (sesuai LKP): input = question + context (hasil retrieval), output = draft_answer + confidence.
const DOSE = /\d+([.,]\d+)?\s?(ml|gram|gr|g|kg|liter|l|cc|%|ppm|sendok)\b/i;
export async function POST(req) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { conversationId, message, dryRun, history: clientHistory } = await req.json().catch(() => ({})); // dryRun: dipakai skrip uji, tidak menyimpan percakapan
  if (!message || !message.trim()) return NextResponse.json({ error: 'Pertanyaan kosong.' }, { status: 400 });
  let c = null;
  try { c = conversationId ? await getConversation(conversationId, user.id) : null; } catch (err) { console.warn('[chat] gagal membaca percakapan:', err.message); }
  // Bila percakapan tidak ditemukan atau penyimpanan bermasalah, konteks diambil dari riwayat yang dikirim klien.
  const clean = (h) => (Array.isArray(h) ? h.slice(-6).map((m) => ({ role: m.role === 'user' ? 'user' : 'ai', text: String(m.text || '').slice(0, 500), summary: String(m.summary || '').slice(0, 500), topic: String(m.topic || '') })) : []);
  const prev = c ? c.messages : clean(clientHistory);
  const lastTopic = [...prev].reverse().find((m) => m.role === 'ai' && m.topic && m.topic !== 'umum')?.topic;
  const history = prev.slice(-4).map((m) => (m.role === 'user' ? { role: 'user', content: m.text } : { role: 'assistant', content: m.summary || '' })).filter((m) => m.content);
  const r = await retrieve(message, lastTopic);
  const top = r.entries[0];
  let out, mode = 'simulasi';
  if (llmEnabled()) {
    try {
      out = await generate({ question: message, entries: r.entries, history });
      if (DOSE.test(JSON.stringify(out))) throw new Error('Jawaban memuat angka takaran');
      mode = 'llm';
    } catch (err) { console.warn('[chat] AI gagal, memakai mode simulasi:', err.message); }
  }
  if (mode === 'simulasi') out = fromEntry(top);
  const refs = mode === 'llm' ? [...new Set(r.entries.flatMap((e) => e.refs))].slice(0, 3) : out.refs;
  const ai = { role: 'ai', mode, model: mode === 'llm' ? MODEL : null, topic: top ? top.id : 'umum', note: r.note, risk: r.risk, confidence: confidence(r.score), title: top ? top.title : GENERIC.title, ...out, refs: refs.length ? refs : GENERIC.refs };
  if (dryRun === true) return NextResponse.json({ message: expand(ai, []) });
  if (!c) {
    c = { id: 'c' + Date.now(), userId: user.id, title: message.slice(0, 70), category: top ? top.category : 'Umum', status: 'Berlangsung', date: new Date().toISOString(), messages: [] };
  }
  c.messages.push({ role: 'user', text: message }, ai);
  try { await saveConversation(c); } catch (err) { console.warn('[chat] riwayat tidak tersimpan:', err.code || err.message); }
  return NextResponse.json({ conversationId: c.id, message: expand(ai, []) });
}
