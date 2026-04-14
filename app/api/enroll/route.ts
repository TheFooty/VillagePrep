import { NextRequest, NextResponse } from 'next/server';
import { enrollStudent, getStudentClasses, getStudentNotes, setStudentNotes } from '@/lib/store';

// POST /api/enroll - enroll in a class
export async function POST(req: NextRequest) {
  try {
    const { email, classId } = await req.json();
    if (!email || !classId) return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
    enrollStudent(email, classId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// GET /api/enroll?email=... - get enrolled classes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    const classes = getStudentClasses(email);
    return NextResponse.json({ classes });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}