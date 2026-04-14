import { NextRequest, NextResponse } from 'next/server';
import { getStudentNotes, setStudentNotes } from '@/lib/store';

// GET /api/notes?email=...&classId=... - get notes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const classId = searchParams.get('classId');
    if (!email || !classId) return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
    const notes = getStudentNotes(email, classId);
    return NextResponse.json({ notes });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// POST /api/notes - set notes
export async function POST(req: NextRequest) {
  try {
    const { email, classId, notes } = await req.json();
    if (!email || !classId) return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
    setStudentNotes(email, classId, notes || '');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}