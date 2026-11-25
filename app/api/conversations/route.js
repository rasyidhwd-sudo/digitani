import { NextResponse } from 'next/server';
import { clearConversations } from '@/lib/db';
import { getUser } from '@/lib/auth';
export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try { await clearConversations(user.id); } catch (e) { return NextResponse.json({ error: 'Gagal menghapus riwayat.' }, { status: 503 }); }
  return NextResponse.json({ ok: true });
}
