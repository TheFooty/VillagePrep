import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_email', email);
  
  if (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ classes: data || [] });
}

export async function POST(req: NextRequest) {
  const cls = await req.json();

  if (!cls.name || typeof cls.name !== 'string' || cls.name.trim().length === 0) {
    return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
  }

  if (cls.name && cls.name.length > 200) {
    return NextResponse.json({ error: 'Class name is too long' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('classes')
    .insert([cls])
    .select();

  if (error) {
    console.error('Error adding class:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
