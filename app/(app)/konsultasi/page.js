import { getConversation, getKnowledge } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { expand } from '@/lib/rag';
import Chat from '@/components/Chat';
import { llmStatus } from '@/lib/llm';
export default async function Konsultasi({ searchParams }) {
  const user = await getUser();
  const c = searchParams.c ? await getConversation(searchParams.c, user.id) : null;
  const kb = await getKnowledge();
  const initial = c ? c.messages.map((m) => (m.role === 'ai' ? expand(m, kb) : m)) : [];
  const status = await llmStatus();
  return <Chat status={status} key={c?.id || 'baru'} conversationId={c?.id || null} initial={initial} autoSend={c ? null : searchParams.q || null} />;
}
