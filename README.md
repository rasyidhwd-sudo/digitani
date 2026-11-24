# DigiTani — Prototipe Web (Next.js 14 + Tailwind + JSON + Google Gemini)

Asisten pertanian berbasis AI untuk IPB DigiTani. AI menjawab langsung ke petani dengan pendekatan
**RAG**: pertanyaan dicocokkan ke basis pengetahuan (`data/knowledge.json`, 15 topik), lalu (opsional)
Google Gemini menyusun jawaban dari konteks tersebut.

> Basis pengetahuan dan referensinya masih **contoh ilustratif**, bukan hasil indeks buku/jurnal asli.

## 1. Menjalankan (PowerShell)
```powershell
npm install
npm run dev
```
Buka http://localhost:3000. Akun demo sudah terisi di halaman login: `budi@digitani.test` / `tani12345`.

Tanpa pengaturan apa pun, aplikasi berjalan di **mode simulasi** (tanpa AI): jawaban diambil dari basis
pengetahuan. Halaman AI Konsultasi dan Pengaturan menampilkan mode yang sedang dipakai.

## 2. Mengaktifkan AI (Google Gemini)
Tanpa pengaturan, aplikasi memakai **mode simulasi**. Untuk memakai Gemini:
1. Buat API key di Google AI Studio (aistudio.google.com).
2. Buat `.env.local` (contoh di `.env.example`):
   ```
   USE_LLM=true
   GEMINI_API_KEY=isi-key-anda
   GEMINI_MODEL=gemini-3.7-flash
   ```
   Nama model: lihat daftar terbaru di dokumentasi Gemini (ai.google.dev/gemini-api/docs/models). Kalau nama
   salah, badge di halaman Pengaturan menampilkan "Model ... tidak ditemukan".
3. Jalankan ulang `npm run dev`. Badge di AI Konsultasi berubah menjadi nama modelnya.

Kalau AI gagal (key salah, kuota habis, jawaban diblokir, jaringan putus), aplikasi otomatis kembali ke mode simulasi.

## 2b. Deploy ke Vercel
Settings > Environment Variables, lalu **Redeploy** setelah menyimpan:

| Nama | Nilai | Tipe |
|---|---|---|
| `USE_LLM` | `true` | Config |
| `GEMINI_MODEL` | nama model Gemini | Config |
| `GEMINI_API_KEY` | key dari Google AI Studio | **Secret** |
| `AUTH_SECRET` | string acak panjang | **Secret** |

Jangan commit key ke GitHub, jangan beri awalan `NEXT_PUBLIC_`, dan jangan tampilkan key di screenshot.
Batasan di Vercel: penyimpanan hanya-baca. Login akun demo tetap jalan, tetapi Daftar akun baru dan riwayat
percakapan **tidak tersimpan permanen**. Untuk itu perlu database online (mis. PostgreSQL).

## 3. Alur satu pertanyaan (`app/api/chat/route.js`)
1. `lib/rag.js > retrieve()`: skor kata kunci mencari 1-2 topik paling relevan (ambang minimum skor 3,
   jadi pertanyaan di luar topik tidak dipaksa cocok) dan mempertahankan konteks topik sebelumnya.
2. Bila `USE_LLM=true`: `lib/llm.js > generate()` mengirim `question` + `context` ke Gemini dan meminta JSON
   terstruktur. Pagar markdown di sekitar JSON dibersihkan bila ada.
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
lib/            db.js (JSON), auth.js, rag.js (retrieval), llm.js (Gemini + status), format.js
data/           users.json, knowledge.json, conversations.json
eval/ scripts/  questions.json dan skrip uji
```

## 6. Catatan
- Rencana kelompok di LKP 6: React + Flask + PostgreSQL. Di prototipe ini API route Next.js berperan sebagai
  backend dan JSON sebagai database. Komunikasi ke model hanya ada di `lib/llm.js`.
- Jalur Gemini diuji dengan server tiruan berformat API Gemini, belum dengan layanan aslinya. Cobalah dulu dengan key Anda.
- JSON sebagai database hanya cocok untuk lokal. Produksi: PostgreSQL dan bcrypt (sekarang SHA-256 tanpa salt).
- Retrieval masih kata kunci. Langkah berikutnya: embedding multibahasa + vector search atas korpus asli.
- Belum ada: panel admin untuk basis pengetahuan, dark mode, streaming jawaban.
