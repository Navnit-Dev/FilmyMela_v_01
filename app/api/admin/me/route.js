import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role')
      .eq('id', user.id)
      .eq('status', 'active')
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { error: 'Not an admin' },
        { status: 403 }
      );
    }

    return NextResponse.json(admin);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
