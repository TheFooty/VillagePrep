import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const classId = searchParams.get('classId');
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
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
