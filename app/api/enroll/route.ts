import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  
  const { data, error } = await supabase
    .from('enrollments')
    .select('class_id')
    .eq('email', email);
  
  if (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const classes = data?.map(d => d.class_id) || [];
  return NextResponse.json({ classes });
}

export async function POST(req: NextRequest) {
  const { email, classId } = await req.json();
  if (!email || !classId) return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
  
  const { error } = await supabase
    .from('enrollments')
    .insert([{ email, class_id: classId }]);
  
  if (error) {
    console.error('Error enrolling:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}
