# DigiTani — Prototipe Web (Next.js 14 + Tailwind + JSON, SLM opsional via Ollama)

Asisten pertanian berbasis AI untuk IPB DigiTani. AI menjawab langsung ke petani dengan pendekatan
**RAG**: pertanyaan dicocokkan ke basis pengetahuan (`data/knowledge.json`, 15 topik), lalu (opsional)
sebuah **SLM lokal** lewat Ollama menyusun jawaban dari konteks tersebut.

> Basis pengetahuan dan referensinya masih **contoh ilustratif**, bukan hasil indeks buku/jurnal asli.

## 1. Menjalankan (PowerShell)
```powershell
npm install
npm run dev
```
Buka http://localhost:3000. Akun demo sudah terisi di halaman login: `budi@digitani.test` / `tani12345`.

Tanpa pengaturan apa pun, aplikasi berjalan di **mode simulasi** (tanpa SLM): jawaban diambil dari basis
pengetahuan. Halaman AI Konsultasi dan Pengaturan menampilkan mode yang sedang dipakai.

## 2. Mengaktifkan SLM (opsional)
1. Pasang Ollama, lalu unduh model sekali saja (sekitar 6 GB):
   ```powershell
   ollama pull qwen3.5:4b
   ```
2. Buat file `.env.local` (salin dari `.env.example`) berisi minimal:
   ```
   USE_LLM=true
   OLLAMA_MODEL=qwen3.5:4b
   ```
3. Pastikan Ollama berjalan, lalu jalankan ulang `npm run dev`. Badge di halaman AI Konsultasi akan
   berubah menjadi `Mode: qwen3.5:4b`.

Catatan untuk laptop tanpa GPU (CPU saja): jawaban pertama lebih lambat karena model dimuat ke memori
(setelah itu model dipertahankan 30 menit). Konteks dan panjang keluaran sudah dibatasi agar lebih ringan.
Kalau terlalu lambat, coba model yang lebih kecil lewat `OLLAMA_MODEL`. Kalau SLM gagal atau Ollama mati,
aplikasi otomatis kembali ke mode simulasi.

## 3. Alur satu pertanyaan (`app/api/chat/route.js`)
1. `lib/rag.js > retrieve()`: skor kata kunci mencari 1-2 topik paling relevan (ambang minimum skor 3,
   jadi pertanyaan di luar topik tidak dipaksa cocok) dan mempertahankan konteks topik sebelumnya.
2. Bila `USE_LLM=true`: `lib/llm.js > generate()` mengirim `question` + `context` ke Ollama dan meminta JSON
   terstruktur. Mode berpikir model dimatikan dan teks `<think>` dibersihkan bila ada.
3. Pengaman: jawaban model yang memuat angka takaran/dosis ditolak dan diganti jawaban dari basis
   pengetahuan. Pertanyaan berisiko (dosis/pestisida/racun) selalu memunculkan peringatan keamanan.
4. Percakapan disimpan ke `data/conversations.json` dan bisa dilanjutkan dari Riwayat.

## 4. Menguji kualitas (`npm run eval`)
Jalankan `npm run dev` di satu terminal, lalu di terminal lain:
```powershell
npm run eval
```
Skrip mengirim 20 pertanyaan di `eval/questions.json`, menampilkan **akurasi retrieval** (topik yang
didapat vs diharapkan), mode, dan waktu per pertanyaan, lalu menyimpan `eval/hasil.csv`. Kolom
`nilai_manual_0_1_2` diisi manual (0 salah, 1 sebagian, 2 benar) untuk menilai kualitas jawabannya.
Tambahkan pertanyaan sendiri ke `eval/questions.json`; pertanyaan bawaan ditulis dengan mengetahui daftar
kata kunci, jadi hasil 100% di sana belum berarti sebaik itu untuk pertanyaan petani sungguhan.

## 5. Struktur
```
app/            landing, login, daftar, (app)/ dashboard konsultasi riwayat pengetahuan profil pengaturan
app/api/        auth/login|logout|register, chat, conversations (DELETE)
components/     Sidebar, Chat, AnswerCard, SettingsPanel, Prefs
lib/            db.js (JSON), auth.js, rag.js (retrieval), llm.js (Ollama + status), format.js
data/           users.json, knowledge.json, conversations.json
eval/ scripts/  questions.json dan skrip uji
```

## 6. Catatan
- Rencana kelompok di LKP 6: React + Flask + PostgreSQL. Di prototipe ini API route Next.js berperan sebagai
  backend dan JSON sebagai database. Komunikasi ke model hanya ada di `lib/llm.js`.
- Jalur SLM diuji dengan server tiruan berformat Ollama, belum dengan model asli. Cobalah dulu di mesin Anda.
- JSON sebagai database hanya cocok untuk lokal. Produksi: PostgreSQL dan bcrypt (sekarang SHA-256 tanpa salt).
- Retrieval masih kata kunci. Langkah berikutnya: embedding multibahasa + vector search atas korpus asli.
- Belum ada: panel admin untuk basis pengetahuan, dark mode, streaming jawaban.
