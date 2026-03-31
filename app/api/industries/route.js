import { NextResponse } from 'next/server';
import { getIndustries, getGenres, getYears } from '@/lib/movies';

export async function GET() {
  try {
    const industries = await getIndustries();
    return NextResponse.json(industries);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    );
  }
}
