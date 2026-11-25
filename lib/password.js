import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'crypto';
// Hash kata sandi dengan scrypt + salt acak (bawaan Node, tanpa dependensi tambahan).
export function hashPassword(pw) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(pw, salt, 64).toString('hex')}`;
}
export function verifyPassword(pw, stored) {
  if (!stored) return false;
  if (stored.startsWith('scrypt$')) {
    const [, salt, hash] = stored.split('$');
    const a = Buffer.from(hash, 'hex'), b = scryptSync(pw, salt, 64);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  return createHash('sha256').update(pw).digest('hex') === stored; // akun lama (SHA-256) tetap bisa masuk
}
