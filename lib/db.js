import fs from 'fs/promises';
import path from 'path';
// "Database" sederhana berbasis file JSON di folder /data (cukup untuk prototipe lokal).
const file = (n) => path.join(process.cwd(), 'data', n + '.json');
export const read = async (n) => JSON.parse(await fs.readFile(file(n), 'utf8'));
export const write = async (n, d) => fs.writeFile(file(n), JSON.stringify(d, null, 2));
