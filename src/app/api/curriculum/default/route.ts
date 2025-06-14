import { NextResponse } from 'next/server';
import { SIMPLIFIED_CAMBRIDGE_CURRICULUM } from '@/lib/simplified-curriculum';

export async function GET() {
  try {
    return NextResponse.json(SIMPLIFIED_CAMBRIDGE_CURRICULUM);
  } catch (error) {
    console.error('Error fetching default curriculum:', error);
    return NextResponse.json({ error: 'Failed to fetch default curriculum' }, { status: 500 });
  }
}