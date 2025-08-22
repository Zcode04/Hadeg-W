// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // إعداد Supabase client مع Middleware
  const supabase = createMiddlewareClient({ req, res });

  // جلب الجلسة من Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthRoute = req.nextUrl.pathname.startsWith('/dashboard');

  // إعادة التوجيه إذا لم يكن هناك جلسة
  if (isAuthRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // إضافة رؤوس الأمان
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');

  return res;
}