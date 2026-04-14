import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const classId = searchParams.get('classId');
  if (!email || !classId) return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
  
  const { data, error } = await supabase
    .from('notes')
    .select('notes')
    .eq('email', email)
    .eq('class_id', classId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ notes: data?.notes || '' });
}

export async function POST(req: NextRequest) {
  const { email, classId, notes } = await req.json();
  if (!email || !classId) return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
  
  const { error } = await supabase
    .from('notes')
    .upsert([{ email, class_id: classId, notes: notes || '' }], { onConflict: 'email,class_id' });
  
  if (error) {
    console.error('Error saving notes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}
