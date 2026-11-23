import { read } from './db';
// Tahap RETRIEVAL dari RAG: mencari entri basis pengetahuan (data/knowledge.json) yang paling relevan.
const RISK = /dosis|takaran|pestisida|insektisida|fungisida|herbisida|racun/i;
const tok = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
export const GENERIC = {
  title: 'Pertanyaan umum', label: 'Informasi yang membantu',
  summary: 'Pertanyaan ini belum cocok dengan topik di basis pengetahuan contoh, jadi informasi yang tersedia masih terbatas.',
  points: ['Jenis tanaman dan fase tumbuhnya', 'Gejala yang terlihat dan sejak kapan muncul', 'Kondisi air, tanah, dan cuaca terbaru'],
  actions: ['Sebutkan tanaman, gejala, dan lokasi lahan dalam pertanyaan', 'Tanyakan ke penyuluh pertanian setempat bila perlu'],
  cautions: ['Informasi di sini masih terbatas'], refs: ['Panduan Pengelolaan Tanaman Terpadu (contoh referensi)'],
};
export async function retrieve(q, lastTopic, k = 2) {
  const kb = await read('knowledge');
  const low = q.toLowerCase(), words = new Set(tok(q));
  const scored = kb.map((e) => {
    let s = 0;
    for (const kw of e.keywords) if (low.includes(kw)) s += 3;
    for (const w of tok(e.title + ' ' + e.summary)) if (words.has(w)) s += 1;
    return { e, s };
  }).filter((x) => x.s >= 3) // ambang minimum: minimal 1 kata kunci atau beberapa kata yang beririsan
    .sort((a, b) => b.s - a.s);
  let entries = scored.slice(0, k).map((x) => x.e), note = '';
  if (!entries.length && lastTopic) {
    const e = kb.find((x) => x.id === lastTopic);
    if (e) { entries = [e]; note = `Melanjutkan topik sebelumnya: ${e.title}.`; }
  }
  return { entries, note, risk: RISK.test(q), score: scored[0]?.s || 0 };
}
// Perkiraan keyakinan dari kecocokan retrieval (bukan probabilitas statistik).
export const confidence = (score) => (score ? Math.min(95, 35 + score * 7) : 20);
export const fromEntry = (e = GENERIC) => ({ title: e.title, summary: e.summary, label: e.label, points: e.points, actions: e.actions, cautions: e.cautions, refs: e.refs });
// Pesan lama (seed) hanya menyimpan topic; pesan baru sudah memuat jawaban lengkap.
export function expand(m, kb) {
  if (m.summary) return { ...m, role: 'ai' };
  const e = kb.find((x) => x.id === m.topic) || GENERIC;
  return { role: 'ai', mode: 'simulasi', topic: m.topic, note: m.note || '', risk: !!m.risk, confidence: null, ...fromEntry(e) };
}
