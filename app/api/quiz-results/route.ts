import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isValidEmail, isValidUUID } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_email', email)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching quiz results:', error);
      return NextResponse.json({ error: 'Failed to fetch quiz results' }, { status: 500 });
    }

    return NextResponse.json({ results: data || [] });
  } catch (err) {
    console.error('QuizResults GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, studySetId, classId, score, total, answers } = await req.json();

    if (!email || score === undefined || !total) {
      return NextResponse.json({ error: 'email, score, and total required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json({ error: 'Score must be a number between 0 and 100' }, { status: 400 });
    }

    if (typeof total !== 'number' || total < 1) {
      return NextResponse.json({ error: 'Total must be a positive number' }, { status: 400 });
    }

    if (studySetId && !isValidUUID(studySetId)) {
      return NextResponse.json({ error: 'Invalid studySetId format' }, { status: 400 });
    }

    if (classId && !isValidUUID(classId)) {
      return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
    }

    if (answers !== undefined && typeof answers !== 'string') {
      return NextResponse.json({ error: 'Answers must be a string' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const id = crypto.randomUUID();

    const { data, error } = await supabase
      .from('quiz_results')
      .insert([{
        id,
        user_email: email,
        study_set_id: studySetId || null,
        class_id: classId || null,
        score,
        total,
        answers: answers || null,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving quiz result:', error);
      return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 });
    }

    return NextResponse.json({ result: data });
  } catch (err) {
    console.error('QuizResults POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const resultId = searchParams.get('resultId');

    if (!resultId) {
      return NextResponse.json({ error: 'resultId required' }, { status: 400 });
    }

    if (!isValidUUID(resultId)) {
      return NextResponse.json({ error: 'Invalid resultId format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('quiz_results')
      .delete()
      .eq('id', resultId);

    if (error) {
      console.error('Error deleting quiz result:', error);
      return NextResponse.json({ error: 'Failed to delete quiz result' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('QuizResults DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}