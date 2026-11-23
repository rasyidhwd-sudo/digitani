import { NextResponse } from 'next/server';
import { read, write } from '@/lib/db';
import { getUser } from '@/lib/auth';
export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await write('conversations', (await read('conversations')).filter((c) => c.userId !== user.id));
  return NextResponse.json({ ok: true });
}
