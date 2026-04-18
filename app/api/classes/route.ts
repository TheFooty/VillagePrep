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
      .from('classes')
      .select('*')
      .eq('teacher_email', email);

    if (classId) {
      query = query.eq('id', classId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching classes:', error);
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
    }

    return NextResponse.json({ classes: data || [] });
  } catch (err) {
    console.error('Classes GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cls = await req.json();

    if (!cls.name || typeof cls.name !== 'string' || cls.name.trim().length === 0) {
      return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
    }

    if (cls.name.length > 200) {
      return NextResponse.json({ error: 'Class name is too long' }, { status: 400 });
    }

    if (cls.description && (typeof cls.description !== 'string' || cls.description.length > 1000)) {
      return NextResponse.json({ error: 'Description is too long' }, { status: 400 });
    }

    if (cls.teacher_email && !isValidEmail(cls.teacher_email)) {
      return NextResponse.json({ error: 'Invalid teacher email format' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('classes')
      .insert([{
        id: crypto.randomUUID(),
        name: cls.name.trim(),
        description: cls.description?.trim() || null,
        teacher_email: cls.teacher_email || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding class:', error);
      return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Classes POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}