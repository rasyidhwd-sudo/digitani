import { getUser } from '@/lib/auth';
export default async function Profil() {
  const u = await getUser();
  return (
    <div>
      <h1 className="text-2xl font-bold">Profil Saya</h1>
      <div className="card flex items-center gap-4 mt-4">
        <div className="w-16 h-16 rounded-full bg-sage text-white grid place-items-center text-xl font-bold">{u.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}</div>
        <div><h2 className="font-semibold">{u.name}</h2><p className="text-sm text-stone">{u.email} · {u.location}</p><p className="text-sm">Komoditas: {u.commodities.join(', ')}</p></div>
      </div>
      <form action="/api/auth/logout" method="post" className="mt-4"><button className="btn2">Keluar</button></form>
    </div>
  );
}
