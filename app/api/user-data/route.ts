import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'files';
  
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  
  const { data, error } = await supabase
    .from('user_data')
    .select('content')
    .eq('email', email)
    .eq('type', type)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ content: data?.content || '' });
}

export async function POST(req: NextRequest) {
  const { email, type, content } = await req.json();
  
  if (!email || !type) {
    return NextResponse.json({ error: 'Email and type required' }, { status: 400 });
  }
  
  const { data: existing } = await supabase
    .from('user_data')
    .select('id')
    .eq('email', email)
    .eq('type', type)
    .single();
  
  let error;
  if (existing) {
    ({ error } = await supabase
      .from('user_data')
      .update({ content: content || '', updated_at: new Date().toISOString() })
      .eq('id', existing.id));
  } else {
    ({ error } = await supabase
      .from('user_data')
      .insert([{ 
        email, 
        type, 
        content: content || '',
        id: crypto.randomUUID()
      }]));
  }
  
  if (error) {
    console.error('Error saving user data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const type = searchParams.get('type');
  
  if (!email || !type) return NextResponse.json({ error: 'Email and type required' }, { status: 400 });
  
  const { error } = await supabase
    .from('user_data')
    .delete()
    .eq('email', email)
    .eq('type', type);
  
  if (error) {
    console.error('Error deleting user data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}