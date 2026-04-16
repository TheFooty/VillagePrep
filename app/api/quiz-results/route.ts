import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_email', email)
    .order('completed_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data || [] });
}

export async function POST(req: NextRequest) {
  const { email, studySetId, classId, score, total, answers } = await req.json();

  if (!email || score === undefined || !total) {
    return NextResponse.json({ error: 'email, score, and total required' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return NextResponse.json({ error: 'Score must be a number between 0 and 100' }, { status: 400 });
  }

  if (typeof total !== 'number' || total < 1) {
    return NextResponse.json({ error: 'Total must be a positive number' }, { status: 400 });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (studySetId && !uuidRegex.test(studySetId)) {
    return NextResponse.json({ error: 'Invalid studySetId format' }, { status: 400 });
  }

  if (classId && !uuidRegex.test(classId)) {
    return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
  }

  const supabase = getSupabase();

  const id = crypto.randomUUID();

  const { data, error } = await supabase
    .from('quiz_results')
    .insert([{
      id,
      user_email: email,
      study_set_id: studySetId || null,
      class_id: classId || null,
      score,
      total,
      answers: answers || null,
      completed_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving quiz result:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ result: data });
}
