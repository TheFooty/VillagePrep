import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  
  const { data, error } = await supabase
    .from('study_sets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching study sets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ studySets: data || [] });
}

export async function POST(req: NextRequest) {
  const { userId, title } = await req.json();
  
  if (!userId || !title) {
    return NextResponse.json({ error: 'userId and title required' }, { status: 400 });
  }
  
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from('study_sets')
    .insert([{ id, user_id: userId, title }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating study set:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ studySet: data });
}

export async function PUT(req: NextRequest) {
  const { studySetId, title, userId } = await req.json();
  
  if (!studySetId || !userId) {
    return NextResponse.json({ error: 'studySetId and userId required' }, { status: 400 });
  }
  
  const updateData: any = {};
  if (title) updateData.title = title;
  
  const { data, error } = await supabase
    .from('study_sets')
    .update(updateData)
    .eq('id', studySetId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating study set:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ studySet: data });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studySetId = searchParams.get('studySetId');
  const userId = searchParams.get('userId');
  
  if (!studySetId || !userId) {
    return NextResponse.json({ error: 'studySetId and userId required' }, { status: 400 });
  }
  
  const { error } = await supabase
    .from('study_sets')
    .delete()
    .eq('id', studySetId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting study set:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}