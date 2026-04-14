import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('email', email)
    .order('last_accessed', { ascending: false });
  
  if (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ progress: data || [] });
}

export async function POST(req: NextRequest) {
  const { email, classId, type, score, details } = await req.json();
  
  if (!email || !classId) {
    return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
  }
  
  const { data: existing } = await supabase
    .from('progress')
    .select('*')
    .eq('email', email)
    .eq('class_id', classId)
    .eq('activity_type', type)
    .single();
  
  let result;
  
  if (existing) {
    const updateData: any = { 
      last_accessed: new Date().toISOString(),
      times_completed: existing.times_completed + 1
    };
    
    if (score !== undefined) {
      const totalScore = (existing.total_score || 0) + score;
      const timesCompleted = existing.times_completed + 1;
      updateData.average_score = Math.round(totalScore / timesCompleted);
      updateData.total_score = totalScore;
    }
    
    if (details) updateData.last_details = details;
    
    const { data, error } = await supabase
      .from('progress')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single();
    
    result = { data, error };
  } else {
    const insertData: any = {
      email,
      class_id: classId,
      activity_type: type,
      last_accessed: new Date().toISOString(),
      times_completed: 1,
      total_score: score || 0,
      average_score: score || 0,
      last_details: details || ''
    };
    
    const { data, error } = await supabase
      .from('progress')
      .insert([insertData])
      .select()
      .single();
    
    result = { data, error };
  }
  
  if (result.error) {
    console.error('Error updating progress:', result.error);
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, progress: result.data });
}
