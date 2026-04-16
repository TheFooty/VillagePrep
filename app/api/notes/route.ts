import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const classId = searchParams.get('classId');
  
  if (!email || !classId) {
    return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
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
  
  const supabase = getSupabase();
  
  // First try to update, then insert if no rows affected
  const { error: updateError } = await supabase
    .from('student_notes')
    .update({ content: notes || '', updated_at: new Date().toISOString() })
    .eq('user_email', email)
    .eq('class_id', classId);
  
  if (updateError) {
    console.error('Error saving notes:', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  
  // If no rows were updated, insert new record
  if (updateError === null) {
    const { error: selectError } = await supabase
      .from('student_notes')
      .select('id')
      .eq('user_email', email)
      .eq('class_id', classId)
      .single();
      
    if (selectError?.code === 'PGRST116') {
      // No existing record, insert new one
      const { error: insertError } = await supabase
        .from('student_notes')
        .insert([{ user_email: email, class_id: classId, content: notes || '' }]);
        
      if (insertError) {
        console.error('Error inserting notes:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }
  }
  
  return NextResponse.json({ success: true });
}
