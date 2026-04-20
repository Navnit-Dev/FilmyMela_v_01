'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ToastProvider } from '@/components/toast';
import { WishlistProvider } from '@/components/wishlist-context';

const SupabaseContext = createContext(null);

export function Providers({ children }) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            if (typeof document === 'undefined') return [];
            return document.cookie.split(';').filter(Boolean).map((cookie) => {
              const [name, ...rest] = cookie.trim().split('=');
              return { name: name.trim(), value: rest.join('=') };
            });
          },
          setAll(cookiesToSet) {
            if (typeof document === 'undefined') return;
            cookiesToSet.forEach(({ name, value, options }) => {
              let cookieString = `${name}=${value}`;
              if (options?.path) cookieString += `; path=${options.path}`;
              if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
              if (options?.domain) cookieString += `; domain=${options.domain}`;
              if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`;
              if (options?.secure) cookieString += '; secure';
              document.cookie = cookieString;
            });
          },
        },
      }
    )
  );

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      <ToastProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </ToastProvider>
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
