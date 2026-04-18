import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: 'Use /api/auth instead' }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({ message: 'Use /api/auth' });
}