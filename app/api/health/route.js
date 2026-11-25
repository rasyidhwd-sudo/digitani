import { NextResponse } from 'next/server';
import { dbStatus } from '@/lib/db';
import { llmStatus } from '@/lib/llm';
export const dynamic = 'force-dynamic';
// Pemeriksaan cepat untuk diagnosis deploy (tidak memuat rahasia): buka /api/health di browser.
export async function GET() {
  return NextResponse.json({ db: await dbStatus(), ai: await llmStatus() });
}
