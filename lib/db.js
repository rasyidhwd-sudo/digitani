import fs from 'fs/promises';
import path from 'path';
import { MongoClient } from 'mongodb';
// Lapisan data. Kalau MONGODB_URI diisi: users & conversations disimpan di MongoDB.
// Kalau kosong: memakai file JSON di folder data/ (praktis untuk pengembangan lokal).
// Basis pengetahuan (knowledge.json) adalah konten statis yang ikut versi kode, jadi tetap dibaca dari file.
const file = (n) => path.join(process.cwd(), 'data', n + '.json');
const readJson = async (n) => JSON.parse(await fs.readFile(file(n), 'utf8'));
const writeJson = async (n, d) => fs.writeFile(file(n), JSON.stringify(d, null, 2));
export const useMongo = () => !!process.env.MONGODB_URI;
const DB = () => process.env.MONGODB_DB || 'digitani';
const P = { projection: { _id: 0 } };

// Koneksi dipakai ulang antar request (penting untuk serverless/Vercel dan hot reload di dev).
async function mongo() {
  const g = globalThis;
  if (!g._dtMongo) {
    g._dtMongo = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 })
      .connect()
      .then(async (client) => { const db = client.db(DB()); await prepare(db); return db; })
      .catch((e) => { g._dtMongo = null; throw e; });
  }
  return g._dtMongo;
}
async function prepare(db) {
  const users = db.collection('users'), convs = db.collection('conversations');
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ id: 1 }, { unique: true });
  await convs.createIndex({ id: 1 }, { unique: true });
  await convs.createIndex({ userId: 1, date: -1 });
  // Data awal (akun demo + contoh percakapan) hanya dimasukkan saat database masih kosong.
  if ((await users.countDocuments({}, { limit: 1 })) === 0) {
    try { await users.insertMany(await readJson('users'), { ordered: false }); } catch {}
    try { await convs.insertMany(await readJson('conversations'), { ordered: false }); } catch {}
  }
}

export const getKnowledge = () => readJson('knowledge');

export async function getUserById(id) {
  if (useMongo()) return (await mongo()).collection('users').findOne({ id }, P);
  return (await readJson('users')).find((u) => u.id === id) || null;
}
export async function getUserByEmail(email) {
  if (useMongo()) return (await mongo()).collection('users').findOne({ email }, P);
  return (await readJson('users')).find((u) => u.email === email) || null;
}
export async function createUser(u) {
  if (useMongo()) { await (await mongo()).collection('users').insertOne({ ...u }); return; }
  const all = await readJson('users'); all.push(u); await writeJson('users', all);
}

export async function listConversations(userId) {
  if (useMongo()) return (await mongo()).collection('conversations').find({ userId }, P).sort({ date: -1 }).toArray();
  return (await readJson('conversations')).filter((c) => c.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
}
export async function getConversation(id, userId) {
  if (useMongo()) return (await mongo()).collection('conversations').findOne({ id, userId }, P);
  return (await readJson('conversations')).find((c) => c.id === id && c.userId === userId) || null;
}
export async function saveConversation(c) {
  if (useMongo()) { await (await mongo()).collection('conversations').replaceOne({ id: c.id }, { ...c }, { upsert: true }); return; }
  const all = await readJson('conversations'), i = all.findIndex((x) => x.id === c.id);
  if (i >= 0) all[i] = c; else all.unshift(c);
  await writeJson('conversations', all);
}
export async function clearConversations(userId) {
  if (useMongo()) { await (await mongo()).collection('conversations').deleteMany({ userId }); return; }
  await writeJson('conversations', (await readJson('conversations')).filter((c) => c.userId !== userId));
}

// Status untuk diagnosis (halaman Pengaturan dan /api/health). Tidak menampilkan URI/password.
export async function dbStatus() {
  if (!useMongo()) return { mode: 'json', detail: 'Penyimpanan: file JSON lokal (MONGODB_URI belum diisi)' };
  try { await (await mongo()).command({ ping: 1 }); return { mode: 'mongo', detail: `MongoDB terhubung (database: ${DB()})` }; }
  catch (e) { console.error('[db]', e.message); return { mode: 'error', detail: 'Tidak bisa terhubung ke MongoDB. Periksa MONGODB_URI, password, dan Network Access di Atlas.' }; }
}
