import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ results: data || [] });
}

export async function POST(req: NextRequest) {
  const { userId, studySetId, classId, score, total, answers } = await req.json();
  
  if (!userId || score === undefined || !total) {
    return NextResponse.json({ error: 'userId, score, and total required' }, { status: 400 });
  }
  
  const id = crypto.randomUUID();
  
  const { data, error } = await supabase
    .from('quiz_results')
    .insert([{ 
      id, 
      user_id: userId, 
      study_set_id: studySetId, 
      class_id: classId,
      score, 
      total,
      answers: answers ? JSON.stringify(answers) : null
    }])
    .select()
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ result: data });
}