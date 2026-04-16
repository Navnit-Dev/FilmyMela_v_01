import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Skip maintenance check for these paths
  if (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/api') || 
    pathname === '/maintenance' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check maintenance mode from Supabase directly
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase env vars');
      return NextResponse.next();
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase
      .from('settings')
      .select('maintenance_mode, maintenance_message')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Maintenance check error:', error);
      return NextResponse.next();
    }
    
    // If maintenance mode is enabled, redirect to maintenance page
    if (data?.maintenance_mode === true) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      url.searchParams.set('message', data.maintenance_message || 'We are currently undergoing maintenance.');
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|maintenance).*)',
  ],
};
