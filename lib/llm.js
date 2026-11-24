// Tahap GENERATION dari RAG: memakai Google Gemini lewat API.
// AI bersifat OPSIONAL: aktif hanya jika USE_LLM=true. Kalau mati atau gagal, aplikasi memakai mode simulasi.
// Ini satu-satunya file yang berbicara dengan model.
const env = process.env;
export const llmEnabled = () => env.USE_LLM === 'true';
const KEY = env.GEMINI_API_KEY || '';
const URL = env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
export const MODEL = env.GEMINI_MODEL || 'gemini-3.7-flash';
const SYSTEM = `Kamu adalah DigiTani AI, asisten informasi pertanian untuk petani Indonesia. Jawab dalam Bahasa Indonesia yang sederhana, ramah, dan jelas.
Aturan:
- Gunakan HANYA informasi pada KONTEKS. Jika konteks tidak cukup, katakan informasinya terbatas dan sarankan bertanya ke penyuluh pertanian setempat.
- Jangan memberi diagnosis pasti; sebutkan kemungkinan penyebab.
- Jangan menyebut angka dosis, takaran, atau konsentrasi bahan kimia apa pun.
- Jangan mengarang sumber, penulis, atau kutipan.
Balas HANYA dengan JSON: {"summary": string, "label": string, "points": string[], "actions": string[], "cautions": string[]}
"summary" berisi 1-2 kalimat. "label" adalah judul singkat untuk daftar "points" (misalnya "Kemungkinan penyebab"). Setiap array berisi 2-4 butir, masing-masing maksimal 15 kata.`;
// Model bisa membungkus JSON dengan pagar markdown atau teks lain; ambil bagian di antara kurung kurawal terluar.
function parseJson(text) {
  const clean = text.trim();
  const a = clean.indexOf('{'), b = clean.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('Model tidak mengembalikan JSON');
  return JSON.parse(clean.slice(a, b + 1));
}
const list = (x) => (Array.isArray(x) ? x.map(String).filter(Boolean).slice(0, 5) : []);
function normalize(j) {
  const out = { summary: String(j.summary || '').trim(), label: String(j.label || 'Hal yang perlu diketahui').trim(), points: list(j.points), actions: list(j.actions), cautions: list(j.cautions) };
  if (!out.summary || !out.points.length) throw new Error('Format jawaban model tidak sesuai');
  return out;
}
// Status untuk UI: mode apa yang sedang dipakai dan kenapa.
export async function llmStatus() {
  if (!llmEnabled()) return { mode: 'simulasi', detail: 'Mode simulasi (AI belum diaktifkan: USE_LLM belum true)' };
  if (!KEY) return { mode: 'simulasi', detail: 'GEMINI_API_KEY belum diisi.' };
  try {
    const r = await fetch(`${URL}/models/${MODEL}`, { headers: { 'x-goog-api-key': KEY }, signal: AbortSignal.timeout(5000) });
    if ([400, 401, 403].includes(r.status)) return { mode: 'simulasi', detail: 'API key Gemini ditolak. Periksa GEMINI_API_KEY.' };
    if (r.status === 404) return { mode: 'simulasi', detail: `Model ${MODEL} tidak ditemukan. Periksa GEMINI_MODEL.` };
    if (!r.ok) return { mode: 'simulasi', detail: `Gemini menjawab ${r.status}.` };
    return { mode: 'llm', model: MODEL, detail: `Model ${MODEL} siap (Google Gemini)` };
  } catch { return { mode: 'simulasi', detail: 'Tidak bisa terhubung ke Gemini API.' }; }
}
// Gemini meminta peran bergantian ('user'/'model') dan diawali 'user'.
function toContents(history, userPrompt) {
  const out = [];
  for (const m of [...history, { role: 'user', content: userPrompt }]) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    if (!out.length && role === 'model') continue;
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].parts[0].text += '\n\n' + m.content;
    else out.push({ role, parts: [{ text: m.content }] });
  }
  return out;
}
export async function generate({ question, entries, history }) {
  if (!KEY) throw new Error('GEMINI_API_KEY belum diisi');
  const context = entries.map((e, i) => `[${i + 1}] ${e.title}\n${e.summary}\nPoin: ${e.points.join('; ')}\nLangkah: ${e.actions.join('; ')}\nPerhatian: ${e.cautions.join('; ')}`).join('\n\n') || '(tidak ada konteks yang cocok)';
  const base = { systemInstruction: { parts: [{ text: SYSTEM }] }, contents: toContents(history, `KONTEKS:\n${context}\n\nPERTANYAAN:\n${question}`), generationConfig: { temperature: 0.2, maxOutputTokens: 2048 } };
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 60000);
  const post = (body) => fetch(`${URL}/models/${MODEL}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY }, signal: ctl.signal, body: JSON.stringify(body) });
  try {
    let r = await post({ ...base, generationConfig: { ...base.generationConfig, responseMimeType: 'application/json' } });
    if (r.status === 400) r = await post(base); // jaga-jaga bila model menolak mode JSON; parseJson tetap menangani teks biasa
    if (!r.ok) throw new Error('Gemini menjawab ' + r.status);
    const d = await r.json();
    const text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    if (!text) throw new Error('Gemini tidak mengembalikan teks (' + (d.candidates?.[0]?.finishReason || d.promptFeedback?.blockReason || 'kosong') + ')');
    return normalize(parseJson(text));
  } finally { clearTimeout(timer); }
}
