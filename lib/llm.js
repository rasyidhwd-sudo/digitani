// Tahap GENERATION dari RAG: memakai model yang sudah ada (default Qwen) lewat Ollama yang berjalan lokal.
// SLM bersifat OPSIONAL: aktif hanya jika USE_LLM=true. Kalau mati atau gagal, aplikasi memakai mode simulasi.
// Ini satu-satunya file yang berbicara dengan model, jadi model/server lain cukup diganti di sini.
const URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
export const MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:4b';
export const llmEnabled = () => process.env.USE_LLM === 'true';
const SYSTEM = `Kamu adalah DigiTani AI, asisten informasi pertanian untuk petani Indonesia. Jawab dalam Bahasa Indonesia yang sederhana, ramah, dan jelas.
Aturan:
- Gunakan HANYA informasi pada KONTEKS. Jika konteks tidak cukup, katakan informasinya terbatas dan sarankan bertanya ke penyuluh pertanian setempat.
- Jangan memberi diagnosis pasti; sebutkan kemungkinan penyebab.
- Jangan menyebut angka dosis, takaran, atau konsentrasi bahan kimia apa pun.
- Jangan mengarang sumber, penulis, atau kutipan.
Balas HANYA dengan JSON: {"summary": string, "label": string, "points": string[], "actions": string[], "cautions": string[]}
"summary" berisi 1-2 kalimat. "label" adalah judul singkat untuk daftar "points" (misalnya "Kemungkinan penyebab"). Setiap array berisi 2-4 butir, masing-masing maksimal 15 kata.`;
// Model "berpikir" (mis. Qwen3) bisa menyelipkan <think>...</think> atau teks lain sebelum JSON.
function parseJson(text) {
  const clean = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const a = clean.indexOf('{'), b = clean.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('Model tidak mengembalikan JSON');
  return JSON.parse(clean.slice(a, b + 1));
}
const call = (body, signal) => fetch(`${URL}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal, body: JSON.stringify(body) });
const list = (x) => (Array.isArray(x) ? x.map(String).filter(Boolean).slice(0, 5) : []);
// Status untuk ditampilkan di UI: mode apa yang sedang dipakai dan kenapa.
export async function llmStatus() {
  if (!llmEnabled()) return { mode: 'simulasi', detail: 'Mode simulasi (SLM belum diaktifkan: USE_LLM belum true)' };
  try {
    const r = await fetch(`${URL}/api/tags`, { signal: AbortSignal.timeout(2500) });
    const names = ((await r.json()).models || []).map((m) => m.name);
    if (!names.some((n) => n === MODEL || n === MODEL + ':latest')) return { mode: 'simulasi', detail: `Model ${MODEL} belum diunduh. Jalankan: ollama pull ${MODEL}` };
    return { mode: 'llm', model: MODEL, detail: `Model ${MODEL} siap (lokal)` };
  } catch { return { mode: 'simulasi', detail: 'Ollama tidak terdeteksi. Pastikan Ollama sedang berjalan.' }; }
}
export async function generate({ question, entries, history }) {
  const context = entries.map((e, i) => `[${i + 1}] ${e.title}\n${e.summary}\nPoin: ${e.points.join('; ')}\nLangkah: ${e.actions.join('; ')}\nPerhatian: ${e.cautions.join('; ')}`).join('\n\n') || '(tidak ada konteks yang cocok)';
  const messages = [{ role: 'system', content: SYSTEM }, ...history, { role: 'user', content: `KONTEKS:\n${context}\n\nPERTANYAAN:\n${question}` }];
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 180000);
  try {
    // Setelan ringan untuk laptop tanpa GPU: konteks kecil, keluaran dibatasi, model tetap di memori 30 menit.
    const base = { model: MODEL, messages, stream: false, format: 'json', keep_alive: '30m', options: { temperature: 0.2, num_predict: 600, num_ctx: 2048 } };
    let r = await call({ ...base, think: false }, ctl.signal); // matikan mode berpikir agar cepat dan keluaran bersih
    if (r.status === 400) r = await call(base, ctl.signal); // model yang tidak mendukung parameter "think"
    if (!r.ok) throw new Error('Ollama menjawab ' + r.status);
    const j = parseJson((await r.json()).message?.content || '');
    const out = { summary: String(j.summary || '').trim(), label: String(j.label || 'Hal yang perlu diketahui').trim(), points: list(j.points), actions: list(j.actions), cautions: list(j.cautions) };
    if (!out.summary || !out.points.length) throw new Error('Format jawaban model tidak sesuai');
    return out;
  } finally { clearTimeout(timer); }
}
