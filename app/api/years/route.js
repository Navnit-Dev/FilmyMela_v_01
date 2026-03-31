import { NextResponse } from 'next/server';
import { getYears } from '@/lib/movies';

export async function GET() {
  try {
    const years = await getYears();
    return NextResponse.json(years);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch years' },
      { status: 500 }
    );
  }
}
