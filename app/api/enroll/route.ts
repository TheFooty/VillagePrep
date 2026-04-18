import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isValidEmail, isValidUUID } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('enrollments')
      .select('class_id')
      .eq('student_email', email);

    if (error) {
      console.error('Error fetching enrollments:', error);
      return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
    }

    const classes = data?.map(d => d.class_id) || [];
    return NextResponse.json({ classes });
  } catch (err) {
    console.error('Enroll GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, classId } = await req.json();

    if (!email || !classId) {
      return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!isValidUUID(classId)) {
      return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('enrollments')
      .insert([{ student_email: email, class_id: classId }]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already enrolled in this class' }, { status: 409 });
      }
      console.error('Error enrolling:', error);
      return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Enroll POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const classId = searchParams.get('classId');

    if (!email || !classId) {
      return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!isValidUUID(classId)) {
      return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('student_email', email)
      .eq('class_id', classId);

    if (error) {
      console.error('Error removing enrollment:', error);
      return NextResponse.json({ error: 'Failed to remove enrollment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Enroll DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}