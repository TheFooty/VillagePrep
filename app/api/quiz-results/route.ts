import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  
  const supabase = getSupabase();
  
  // Use user_email field since that's what the table uses
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_email', userId)
    .order('completed_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ results: data || [] });
}

export async function POST(req: NextRequest) {
  const { userId, studySetId, classId, score, total, answers } = await req.json();

  if (!userId || score === undefined || !total) {
    return NextResponse.json({ error: 'userId, score, and total required' }, { status: 400 });
  }

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return NextResponse.json({ error: 'Score must be a number between 0 and 100' }, { status: 400 });
  }

  if (typeof total !== 'number' || total < 1) {
    return NextResponse.json({ error: 'Total must be a positive number' }, { status: 400 });
  }

  const supabase = getSupabase();

  const id = crypto.randomUUID();

  const { data, error } = await supabase
    .from('quiz_results')
    .insert([{
      id,
      user_email: userId,
      study_set_id: studySetId,
      class_id: classId,
      score,
      total,
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
