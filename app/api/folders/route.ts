import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  
  const { data: folders, error } = await supabase
    .from('folders')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ folders: folders || [] });
}

export async function POST(req: NextRequest) {
  const { email, name, color, classIds } = await req.json();
  
  if (!email || !name) {
    return NextResponse.json({ error: 'Email and folder name required' }, { status: 400 });
  }
  
  const { data, error } = await supabase
    .from('folders')
    .insert([{ 
      email, 
      name, 
      color: color || '#e94560',
      class_ids: classIds || []
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, folder: data });
}

export async function PUT(req: NextRequest) {
  const { email, folderId, name, color, classIds } = await req.json();
  
  if (!email || !folderId) {
    return NextResponse.json({ error: 'Email and folderId required' }, { status: 400 });
  }
  
  const updateData: any = {};
  if (name) updateData.name = name;
  if (color) updateData.color = color;
  if (classIds) updateData.class_ids = classIds;
  
  const { data, error } = await supabase
    .from('folders')
    .update(updateData)
    .eq('id', folderId)
    .eq('email', email)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, folder: data });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get('folderId');
  const email = searchParams.get('email');
  
  if (!email || !folderId) {
    return NextResponse.json({ error: 'Email and folderId required' }, { status: 400 });
  }
  
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)
    .eq('email', email);
  
  if (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}
