import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('classes').select('*');
  if (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const cls = await req.json();
  const { data, error } = await supabase.from('classes').insert([cls]).select();
  if (error) {
    console.error('Error adding class:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
