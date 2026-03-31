import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Check if any admin exists
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { count, error } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error checking admin:', error);
      return NextResponse.json({ hasAdmin: false });
    }

    return NextResponse.json({ hasAdmin: count > 0 });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json({ hasAdmin: false });
  }
}
