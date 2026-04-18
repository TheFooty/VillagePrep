import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isValidUUID } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studySetId = searchParams.get('studySetId');

    if (!studySetId) {
      return NextResponse.json({ error: 'studySetId required' }, { status: 400 });
    }

    if (!isValidUUID(studySetId)) {
      return NextResponse.json({ error: 'Invalid studySetId format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data: flashcards, error: fcError } = await supabase
      .from('generated_flashcards')
      .select('*')
      .eq('study_set_id', studySetId)
      .order('created_at', { ascending: false });

    if (fcError) {
      console.error('Error fetching flashcards:', fcError);
    }

    const { data: quizzes, error: quizError } = await supabase
      .from('generated_quizzes')
      .select('*')
      .eq('study_set_id', studySetId)
      .order('created_at', { ascending: false });

    if (quizError) {
      console.error('Error fetching quizzes:', quizError);
    }

    const { data: notes, error: notesError } = await supabase
      .from('generated_notes')
      .select('*')
      .eq('study_set_id', studySetId)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('Error fetching notes:', notesError);
    }

    if (fcError || quizError || notesError) {
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }

    return NextResponse.json({
      flashcards: flashcards || [],
      quizzes: quizzes || [],
      notes: notes || []
    });
  } catch (err) {
    console.error('StudySetContent GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studySetId, contentType, content } = await req.json();

    if (!studySetId || !contentType || !content) {
      return NextResponse.json({ error: 'studySetId, contentType, and content required' }, { status: 400 });
    }

    if (!isValidUUID(studySetId)) {
      return NextResponse.json({ error: 'Invalid studySetId format' }, { status: 400 });
    }

    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Content must be a string' }, { status: 400 });
    }

    if (content.length > 100000) {
      return NextResponse.json({ error: 'Content is too large (max 100KB)' }, { status: 400 });
    }

    const validContentTypes = ['flashcards', 'quiz', 'notes'];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json({ error: 'Invalid contentType' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const id = crypto.randomUUID();

    let tableName: string;
    switch (contentType) {
      case 'flashcards':
        tableName = 'generated_flashcards';
        break;
      case 'quiz':
        tableName = 'generated_quizzes';
        break;
      case 'notes':
        tableName = 'generated_notes';
        break;
      default:
        return NextResponse.json({ error: 'Invalid contentType' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert([{ id, study_set_id: studySetId, content }])
      .select()
      .single();

    if (error) {
      console.error(`Error saving ${contentType}:`, error);
      return NextResponse.json({ error: `Failed to save ${contentType}` }, { status: 500 });
    }

    return NextResponse.json({ generated: data });
  } catch (err) {
    console.error('StudySetContent POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');

    if (!contentId || !contentType) {
      return NextResponse.json({ error: 'contentId and contentType required' }, { status: 400 });
    }

    if (!isValidUUID(contentId)) {
      return NextResponse.json({ error: 'Invalid contentId format' }, { status: 400 });
    }

    const validContentTypes = ['flashcards', 'quiz', 'notes'];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json({ error: 'Invalid contentType' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    let tableName: string;
    switch (contentType) {
      case 'flashcards':
        tableName = 'generated_flashcards';
        break;
      case 'quiz':
        tableName = 'generated_quizzes';
        break;
      case 'notes':
        tableName = 'generated_notes';
        break;
      default:
        return NextResponse.json({ error: 'Invalid contentType' }, { status: 400 });
    }

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', contentId);

    if (error) {
      console.error(`Error deleting ${contentType}:`, error);
      return NextResponse.json({ error: `Failed to delete ${contentType}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('StudySetContent DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}