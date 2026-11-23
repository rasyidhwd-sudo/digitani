import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
export const dynamic = 'force-dynamic';
export default async function AppLayout({ children }) {
  const user = await getUser();
  if (!user) redirect('/login');
  return (
    <div className="md:grid md:grid-cols-[240px_1fr] min-h-screen">
      <Sidebar user={user} />
      <main className="p-4 md:p-8 pb-24 md:pb-8 min-w-0">{children}</main>
    </div>
  );
}
