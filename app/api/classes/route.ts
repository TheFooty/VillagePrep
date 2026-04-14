// Simple in-memory store for development.
// Classes reset on server restart — connect Supabase for persistence.

import { NextRequest, NextResponse } from 'next/server';
import { createStore } from '@/lib/store';

interface VPClass {
  id: string;
  name: string;
  content: string;
  testDate: string;
  teacherEmail: string;
}

const classStore = createStore<VPClass>();

export function getClasses(): VPClass[] {
  return classStore.getAll();
}

export function addClass(cls: VPClass): void {
  classStore.add(cls);
}

export async function GET() {
  return NextResponse.json(getClasses());
}

export async function POST(req: NextRequest) {
  const cls = await req.json();
  addClass(cls);
  return NextResponse.json({ success: true });
}