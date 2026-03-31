import { NextResponse } from 'next/server';

export async function proxy(request) {
  // Only check maintenance mode for public pages, not admin or API
  const pathname = request.nextUrl.pathname;
  
  if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname === '/maintenance') {
    return NextResponse.next();
  }

  // Check maintenance mode from settings
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/settings/maintenance`);
    if (res.ok) {
      const data = await res.json();
      
      if (data.maintenance_mode) {
        // Redirect to maintenance page
        const url = request.nextUrl.clone();
        url.pathname = '/maintenance';
        url.searchParams.set('message', data.maintenance_message || 'We are currently undergoing maintenance.');
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error('Maintenance check error:', error);
    // Continue on error to avoid blocking users
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|maintenance).*)',
  ],
};
