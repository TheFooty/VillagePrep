import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const classId = searchParams.get('classId');

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

  const { data, error } = await supabase
    .from('student_notes')
    .select('content')
    .eq('user_email', email)
    .eq('class_id', classId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data?.content || '' });
}

export async function POST(req: NextRequest) {
  const { email, classId, notes } = await req.json();

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

  if (notes !== undefined && typeof notes !== 'string') {
    return NextResponse.json({ error: 'Notes must be a string' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from('student_notes')
    .select('id')
    .eq('user_email', email)
    .eq('class_id', classId)
    .single();

  let error;

  if (existing) {
    ({ error } = await supabase
      .from('student_notes')
      .update({ content: notes || '', updated_at: new Date().toISOString() })
      .eq('id', existing.id));
  } else {
    ({ error } = await supabase
      .from('student_notes')
      .insert([{ user_email: email, class_id: classId, content: notes || '' }]));
  }

  if (error) {
    console.error('Error saving notes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
