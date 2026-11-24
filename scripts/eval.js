// Skrip uji: kirim daftar pertanyaan ke aplikasi yang sedang berjalan, lalu simpan hasilnya ke eval/hasil.csv
// untuk dinilai manual. Pakai: jalankan "npm run dev" di satu terminal, lalu "npm run eval" di terminal lain.
const fs = require('fs');
const B = process.env.BASE || 'http://localhost:3000';
const csv = (v) => '"' + String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
(async () => {
  const qs = JSON.parse(fs.readFileSync('eval/questions.json', 'utf8'));
  const login = await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'budi@digitani.test', password: 'tani12345' }) }).catch(() => null);
  if (!login || !login.ok) { console.error('Gagal login. Pastikan aplikasi berjalan di ' + B); process.exit(1); }
  const sc = login.headers.getSetCookie ? login.headers.getSetCookie() : [login.headers.get('set-cookie')];
  const cookie = sc.map((c) => c.split(';')[0]).join('; ');
  const rows = [['no', 'pertanyaan', 'topik_diharapkan', 'topik_didapat', 'retrieval_benar', 'mode', 'waktu_detik', 'ringkasan_jawaban', 'nilai_manual_0_1_2', 'catatan']];
  let ok = 0, llm = 0, total = 0;
  for (const [i, x] of qs.entries()) {
    const t0 = Date.now();
    const res = await fetch(B + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify({ message: x.q, dryRun: true }) });
    const m = (await res.json()).message || {};
    const sec = ((Date.now() - t0) / 1000).toFixed(1);
    const benar = m.topic === x.expected; if (benar) ok++; if (m.mode === 'llm') llm++; total += Date.now() - t0;
    rows.push([i + 1, x.q, x.expected, m.topic, benar ? 'ya' : 'tidak', m.mode, sec, m.summary, '', '']);
    console.log(`${String(i + 1).padStart(2)}. ${benar ? 'OK   ' : 'SALAH'} [${m.mode}, ${sec}s] ${x.q}${benar ? '' : '  (dapat: ' + m.topic + ')'}`);
  }
  fs.writeFileSync('eval/hasil.csv', '\ufeff' + rows.map((r) => r.map(csv).join(',')).join('\n'));
  console.log(`\nRetrieval benar: ${ok}/${qs.length} (${Math.round((ok / qs.length) * 100)}%)`);
  console.log(`Jawaban dari Gemini: ${llm}/${qs.length} | rata-rata waktu: ${(total / qs.length / 1000).toFixed(1)} detik`);
  console.log('Hasil lengkap: eval/hasil.csv (isi kolom nilai_manual: 0 salah, 1 sebagian, 2 benar)');
})();
