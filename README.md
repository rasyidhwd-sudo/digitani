# DigiTani — Prototipe Web (Next.js 14 + Tailwind + MongoDB + Google Gemini)

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

## 2b. Database (MongoDB)
Akun dan riwayat percakapan disimpan di MongoDB bila `MONGODB_URI` diisi. Kalau kosong, aplikasi memakai file JSON
di folder `data/` (praktis untuk lokal, tetapi tidak permanen di Vercel). Basis pengetahuan (`knowledge.json`)
tetap berupa file karena isinya statis dan ikut versi kode.

Menyiapkan MongoDB Atlas (cloud):
1. Buat akun dan sebuah cluster di mongodb.com/atlas (ada pilihan cluster gratis; cek batasnya di situs mereka).
2. **Database Access**: buat user database dengan password kuat (hindari karakter khusus, atau URL-encode
   passwordnya di connection string).
3. **Network Access**: untuk Vercel, alamat IP-nya berubah-ubah, jadi biasanya perlu mengizinkan `0.0.0.0/0`.
   Karena itu pakai password yang kuat dan jangan isi data sensitif di prototipe ini.
4. Klik **Connect > Drivers**, salin connection string, ganti `<password>` dengan password user tadi.
5. Isi `MONGODB_URI` (di `.env.local` atau Vercel) dengan string itu. `MONGODB_DB` opsional (default `digitani`).

Saat pertama terhubung ke database yang masih kosong, aplikasi membuat indeks dan mengisi data awal (akun demo
`budi@digitani.test` / `tani12345` dan 3 contoh percakapan). Setelah itu data awal tidak diisi ulang.
Koleksi: `users`, `conversations`. Kata sandi disimpan sebagai hash scrypt + salt.

Cek koneksi: buka `/api/health` di browser, atau halaman Pengaturan.

## 2c. Deploy ke Vercel
Settings > Environment Variables, lalu **Redeploy** setelah menyimpan:

| Nama | Nilai | Tipe |
|---|---|---|
| `MONGODB_URI` | connection string Atlas | **Secret** |
| `MONGODB_DB` | `digitani` (opsional) | Config |
| `USE_LLM` | `true` | Config |
| `GEMINI_MODEL` | nama model Gemini | Config |
| `GEMINI_API_KEY` | key dari Google AI Studio | **Secret** |
| `AUTH_SECRET` | string acak panjang | **Secret** |

Jangan commit key/URI ke GitHub, jangan beri awalan `NEXT_PUBLIC_`, dan jangan tampilkan nilainya di screenshot.
Setelah deploy, buka `/api/health`: `db.mode` harus `mongo` dan `ai.mode` harus `llm`.

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
app/api/        auth/login|logout|register, chat, conversations (DELETE), health
components/     Sidebar, Chat, AnswerCard, SettingsPanel, Prefs
lib/            db.js (MongoDB/JSON), password.js, auth.js, rag.js (retrieval), llm.js (Gemini + status), format.js
data/           knowledge.json (basis pengetahuan) + data awal users.json, conversations.json
eval/ scripts/  questions.json dan skrip uji
```

## 6. Catatan
- Rencana kelompok di LKP 6: React + Flask + PostgreSQL. Di prototipe ini API route Next.js berperan sebagai
  backend dan JSON sebagai database. Komunikasi ke model hanya ada di `lib/llm.js`.
- Jalur Gemini diuji dengan server tiruan berformat API Gemini, belum dengan layanan aslinya. Cobalah dulu dengan key Anda.
- Fallback JSON hanya cocok untuk lokal.
- Retrieval masih kata kunci. Langkah berikutnya: embedding multibahasa + vector search atas korpus asli.
- Belum ada: panel admin untuk basis pengetahuan, dark mode, streaming jawaban.
