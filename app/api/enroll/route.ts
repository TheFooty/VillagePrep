import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('enrollments')
    .select('class_id')
    .eq('student_email', email);
  
  if (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const classes = data?.map(d => d.class_id) || [];
  return NextResponse.json({ classes });
}

export async function POST(req: NextRequest) {
  const { email, classId } = await req.json();

  if (!email || !classId) {
    return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(classId)) {
    return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from('enrollments')
    .insert([{ student_email: email, class_id: classId }]);

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already enrolled in this class' }, { status: 409 });
    }
    console.error('Error enrolling:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
