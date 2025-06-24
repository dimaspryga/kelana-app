import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // FIX: Pengecualian eksplisit untuk semua rute API di awal.
    // Ini mencegah middleware memverifikasi panggilannya sendiri (mencegah infinite loop).
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    // Grup rute
    const adminOnlyRoutes = ['/dashboard', '/admin'];
    const userRoutesThatRequireLogin = ['/cart', '/transaction', '/profile'];
    const adminForbiddenRoutes = ['/', '/banner', '/category', '/activity', '/promo', '/cart', '/transaction', '/profile'];
    const authRoutes = ['/login', '/register'];

    // Aturan untuk pengguna yang BELUM LOGIN
    if (!token) {
        if (adminOnlyRoutes.some(p => pathname.startsWith(p)) || userRoutesThatRequireLogin.some(p => pathname.startsWith(p))) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirectedFrom', pathname);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }

    // Aturan untuk pengguna yang SUDAH LOGIN
    try {
        const verifyUrl = `${request.nextUrl.origin}/api/verify`;

        const response = await fetch(verifyUrl, {
            headers: {
                Cookie: `token=${token}`
            }
        });

        if (!response.ok) throw new Error('Invalid token');

        const { data: user } = await response.json();
        const isAdmin = user?.role === 'admin';

        if (authRoutes.some(p => pathname.startsWith(p))) {
            return NextResponse.redirect(new URL(isAdmin ? '/dashboard' : '/', request.url));
        }

        if (isAdmin) {
            if (adminForbiddenRoutes.includes(pathname)) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } else {
            if (adminOnlyRoutes.some(p => pathname.startsWith(p))) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }

        return NextResponse.next();

    } catch (error) {
        console.error('Middleware verification failed:', error);
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
    }
}

// Konfigurasi path yang akan dijalankan oleh middleware
export const config = {
    // Jalankan middleware di semua path KECUALI yang berhubungan langsung dengan file aset
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|assets).*)',
    ],
};
