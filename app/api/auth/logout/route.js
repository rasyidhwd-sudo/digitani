import { NextResponse } from 'next/server';
export async function POST(req) {
  const res = NextResponse.redirect(new URL('/', req.url), 303);
  res.cookies.delete('dt_user');
  return res;
}
