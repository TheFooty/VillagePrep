import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isValidEmail } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'files';

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (typeof type !== 'string' || type.length > 50) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_data')
      .select('content')
      .eq('user_id', userId)
      .eq('data_type', type)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user data:', error);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    return NextResponse.json({ content: data?.content || '' });
  } catch (err) {
    console.error('UserData GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, type, content } = await req.json();

    if (!userId || !type) {
      return NextResponse.json({ error: 'User ID and type required' }, { status: 400 });
    }

    if (typeof type !== 'string' || type.length > 50) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (content !== undefined && typeof content !== 'string') {
      return NextResponse.json({ error: 'Content must be a string' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { data: existing } = await supabase
      .from('user_data')
      .select('id')
      .eq('user_id', userId)
      .eq('data_type', type)
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
          id: crypto.randomUUID(),
          user_id: userId,
          data_type: type,
          content: content || ''
        }]));
    }

    if (error) {
      console.error('Error saving user data:', error);
      return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('UserData POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    if (!userId || !type) {
      return NextResponse.json({ error: 'User ID and type required' }, { status: 400 });
    }

    if (typeof type !== 'string' || type.length > 50) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('user_data')
      .delete()
      .eq('user_id', userId)
      .eq('data_type', type);

    if (error) {
      console.error('Error deleting user data:', error);
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('UserData DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}