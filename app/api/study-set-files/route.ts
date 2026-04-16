import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studySetId = searchParams.get('studySetId');
  
  if (!studySetId) return NextResponse.json({ error: 'studySetId required' }, { status: 400 });
  
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('study_set_files')
    .select('*')
    .eq('study_set_id', studySetId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ files: data || [] });
}

export async function POST(req: NextRequest) {
  const { studySetId, fileName, content, fileType } = await req.json();

  if (!studySetId || !content) {
    return NextResponse.json({ error: 'studySetId and content required' }, { status: 400 });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(studySetId)) {
    return NextResponse.json({ error: 'Invalid studySetId format' }, { status: 400 });
  }

  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'Content must be a string' }, { status: 400 });
  }

  if (content.length > 10000000) {
    return NextResponse.json({ error: 'Content is too large (max 10MB)' }, { status: 400 });
  }

  const supabase = getSupabase();
  const id = crypto.randomUUID();

  const { data, error } = await supabase
    .from('study_set_files')
    .insert([{
      id,
      study_set_id: studySetId,
      file_name: (fileName && typeof fileName === 'string') ? fileName.slice(0, 255) : 'Untitled',
      content,
      file_type: fileType || 'text'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ file: data });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');
  
  if (!fileId) return NextResponse.json({ error: 'fileId required' }, { status: 400 });
  
  const supabase = getSupabase();
  
  const { error } = await supabase
    .from('study_set_files')
    .delete()
    .eq('id', fileId);
  
  if (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}
