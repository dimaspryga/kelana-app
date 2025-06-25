import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    const adminPaths = ['/dashboard', '/admin', '/users', '/banners', '/categories', '/activities', '/promos', '/transactions'];
    const userProtectedRoutes = ['/cart', '/profile'];
    const authRoutes = ['/login', '/register'];

    const isAdminPath = adminPaths.some(p => pathname.startsWith(p));
    const isUserPath = userProtectedRoutes.some(p => pathname.startsWith(p));

    if (!token) {
        if (isAdminPath || isUserPath) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirectedFrom', pathname);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }
    try {
        const verifyUrl = `${request.nextUrl.origin}/api/verify`;
        const response = await fetch(verifyUrl, {
            headers: { 'Cookie': `token=${token}` }
        });

        if (!response.ok) throw new Error('Invalid or expired token');

        const { data: user } = await response.json();
        const isAdmin = user?.role === 'admin';

        if (authRoutes.some(p => pathname.startsWith(p))) {
            return NextResponse.redirect(new URL(isAdmin ? '/dashboard' : '/', request.url));
        }
        if (!isAdmin && isAdminPath) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        if (isAdmin && (pathname === '/' || pathname === '/cart' || pathname === '/profile')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();

    } catch (error) {
        console.error('Middleware verification failed:', error.message);
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
    }
}


export const config = {
    matcher: [
        '/((?!api/|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};
