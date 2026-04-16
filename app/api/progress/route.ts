import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const classId = searchParams.get('classId');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  if (classId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(classId)) {
      return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
    }
  }

  const supabase = getSupabase();

  let query = supabase
    .from('quiz_results')
    .select('*')
    .eq('user_email', email)
    .order('completed_at', { ascending: false });

  if (classId) {
    query = query.eq('class_id', classId);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data || [] });
}

export async function POST(req: NextRequest) {
  const { email, classId, score, total, details } = await req.json();

  if (!email || !classId || score === undefined || !total) {
    return NextResponse.json({ error: 'Email, classId, score, and total required' }, { status: 400 });
  }

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return NextResponse.json({ error: 'Score must be a number between 0 and 100' }, { status: 400 });
  }

  if (typeof total !== 'number' || total < 1) {
    return NextResponse.json({ error: 'Total must be a positive number' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('quiz_results')
    .insert([{
      user_email: email,
      class_id: classId,
      score,
      total,
      completed_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, progress: data });
}
