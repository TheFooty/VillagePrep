import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studySetId = searchParams.get('studySetId');
  
  if (!studySetId) return NextResponse.json({ error: 'studySetId required' }, { status: 400 });
  
  const { data: flashcards, error: fcError } = await supabase
    .from('generated_flashcards')
    .select('*')
    .eq('study_set_id', studySetId)
    .order('created_at', { ascending: false });
  
  const { data: quizzes, error: quizError } = await supabase
    .from('generated_quizzes')
    .select('*')
    .eq('study_set_id', studySetId)
    .order('created_at', { ascending: false });
  
  const { data: notes, error: notesError } = await supabase
    .from('generated_notes')
    .select('*')
    .eq('study_set_id', studySetId)
    .order('created_at', { ascending: false });
  
  if (fcError || quizError || notesError) {
    console.error('Error fetching generated content:', fcError || quizError || notesError);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
  
  return NextResponse.json({ 
    flashcards: flashcards || [],
    quizzes: quizzes || [],
    notes: notes || []
  });
}

export async function POST(req: NextRequest) {
  const { studySetId, contentType, content } = await req.json();
  
  if (!studySetId || !contentType || !content) {
    return NextResponse.json({ error: 'studySetId, contentType, and content required' }, { status: 400 });
  }
  
  const id = crypto.randomUUID();
  
  if (contentType === 'flashcards') {
    const { data, error } = await supabase
      .from('generated_flashcards')
      .insert([{ id, study_set_id: studySetId, content }])
      .select()
      .single();
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ generated: data });
  }
  
  if (contentType === 'quiz') {
    const { data, error } = await supabase
      .from('generated_quizzes')
      .insert([{ id, study_set_id: studySetId, content }])
      .select()
      .single();
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ generated: data });
  }
  
  if (contentType === 'notes') {
    const { data, error } = await supabase
      .from('generated_notes')
      .insert([{ id, study_set_id: studySetId, content }])
      .select()
      .single();
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ generated: data });
  }
  
  return NextResponse.json({ error: 'Invalid contentType' }, { status: 400 });
}