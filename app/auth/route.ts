import { NextRequest, NextResponse } from 'next/server';

// Placeholder auth route — implement real auth logic here.
export async function GET() {
  return NextResponse.json({ message: 'Auth endpoint (GET) — not implemented' }, { status: 404 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'Auth endpoint (POST) — not implemented' }, { status: 501 });
}