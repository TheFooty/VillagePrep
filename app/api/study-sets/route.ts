import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isValidEmail, isValidUUID, validateSession, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await validateSession(req);
    if (!sessionUser) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (email.toLowerCase() !== sessionUser.email.toLowerCase()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('study_sets')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching study sets:', error);
      return NextResponse.json({ error: 'Failed to fetch study sets' }, { status: 500 });
    }

    return NextResponse.json({ studySets: data || [] });
  } catch (err) {
    console.error('StudySets GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await validateSession(req);
    if (!sessionUser) {
      return unauthorizedResponse();
    }

    const { email, title, folderId } = await req.json();

    if (!email || !title) {
      return NextResponse.json({ error: 'Email and title required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (email.toLowerCase() !== sessionUser.email.toLowerCase()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title must be a non-empty string' }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Title is too long' }, { status: 400 });
    }

    if (folderId !== undefined && folderId !== null && !isValidUUID(folderId)) {
      return NextResponse.json({ error: 'Invalid folderId format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('study_sets')
      .insert([{ id, user_email: email, title: title.trim(), folder_id: folderId || null }])
      .select()
      .single();

    if (error) {
      console.error('Error creating study set:', error);
      return NextResponse.json({ error: 'Failed to create study set' }, { status: 500 });
    }

    return NextResponse.json({ studySet: data });
  } catch (err) {
    console.error('StudySets POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { studySetId, title, email, folderId } = await req.json();

    if (!studySetId || !email) {
      return NextResponse.json({ error: 'StudySetId and email required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!isValidUUID(studySetId)) {
      return NextResponse.json({ error: 'Invalid studySetId format' }, { status: 400 });
    }

    if (title && (typeof title !== 'string' || title.trim().length === 0)) {
      return NextResponse.json({ error: 'Title must be a non-empty string' }, { status: 400 });
    }

    if (title && title.length > 200) {
      return NextResponse.json({ error: 'Title is too long' }, { status: 400 });
    }

    if (folderId !== undefined && folderId !== null && !isValidUUID(folderId)) {
      return NextResponse.json({ error: 'Invalid folderId format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title.trim();
    if (folderId !== undefined) updateData.folder_id = folderId;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('study_sets')
      .update(updateData)
      .eq('id', studySetId)
      .eq('user_email', email)
      .select()
      .single();

    if (error) {
      console.error('Error updating study set:', error);
      return NextResponse.json({ error: 'Failed to update study set' }, { status: 500 });
    }

    return NextResponse.json({ studySet: data });
  } catch (err) {
    console.error('StudySets PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studySetId = searchParams.get('studySetId');
    const email = searchParams.get('email');

    if (!studySetId || !email) {
      return NextResponse.json({ error: 'StudySetId and email required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!isValidUUID(studySetId)) {
      return NextResponse.json({ error: 'Invalid studySetId format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('study_sets')
      .delete()
      .eq('id', studySetId)
      .eq('user_email', email);

    if (error) {
      console.error('Error deleting study set:', error);
      return NextResponse.json({ error: 'Failed to delete study set' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('StudySets DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}