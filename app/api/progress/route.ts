import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isValidEmail, isValidUUID } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const classId = searchParams.get('classId');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (classId && !isValidUUID(classId)) {
      return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    let query = supabase
      .from('quiz_results')
      .select('*')
      .eq('user_email', email)
      .order('completed_at', { ascending: false });

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('Error fetching progress:', error);
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    return NextResponse.json({ progress: data || [] });
  } catch (err) {
    console.error('Progress GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, classId, score, total, studySetId, details } = await req.json();

    if (!email || score === undefined || !total) {
      return NextResponse.json({ error: 'Email, score, and total required' }, { status: 400 });
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

    if (classId && !isValidUUID(classId)) {
      return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
    }

    if (studySetId && !isValidUUID(studySetId)) {
      return NextResponse.json({ error: 'Invalid studySetId format' }, { status: 400 });
    }

    if (details !== undefined && typeof details !== 'string') {
      return NextResponse.json({ error: 'Details must be a string' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('quiz_results')
      .insert([{
        id: crypto.randomUUID(),
        user_email: email,
        class_id: classId || null,
        study_set_id: studySetId || null,
        score,
        total,
        answers: details || null,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error updating progress:', error);
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }

    return NextResponse.json({ success: true, progress: data });
  } catch (err) {
    console.error('Progress POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}