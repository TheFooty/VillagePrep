import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isValidEmail, isValidUUID } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const classId = searchParams.get('classId');

    if (!email || !classId) {
      return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!isValidUUID(classId)) {
      return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('student_notes')
      .select('id, content, class_id, user_email, created_at, updated_at')
      .eq('user_email', email)
      .eq('class_id', classId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notes:', error);
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    return NextResponse.json({ notes: data?.content || '' });
  } catch (err) {
    console.error('Notes GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, classId, notes } = await req.json();

    if (!email || !classId) {
      return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!isValidUUID(classId)) {
      return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
    }

    if (notes !== undefined && typeof notes !== 'string') {
      return NextResponse.json({ error: 'Notes must be a string' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data: existing } = await supabase
      .from('student_notes')
      .select('id')
      .eq('user_email', email)
      .eq('class_id', classId)
      .single();

    let error;

    if (existing) {
      ({ error } = await supabase
        .from('student_notes')
        .update({ content: notes || '', updated_at: new Date().toISOString() })
        .eq('id', existing.id));
    } else {
      ({ error } = await supabase
        .from('student_notes')
        .insert([{ 
          id: crypto.randomUUID(),
          user_email: email, 
          class_id: classId, 
          content: notes || '' 
        }]));
    }

    if (error) {
      console.error('Error saving notes:', error);
      return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Notes POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const classId = searchParams.get('classId');

    if (!email || !classId) {
      return NextResponse.json({ error: 'Email and classId required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!isValidUUID(classId)) {
      return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('student_notes')
      .delete()
      .eq('user_email', email)
      .eq('class_id', classId);

    if (error) {
      console.error('Error deleting notes:', error);
      return NextResponse.json({ error: 'Failed to delete notes' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Notes DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}