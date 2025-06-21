import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Grup rute
    const adminOnlyRoutes = ['/dashboard'];
    const userRoutesThatRequireLogin = ['/cart', '/transaction', '/profile'];
    const adminForbiddenRoutes = ['/', '/banner', '/category', '/activity', '/promo', '/cart', '/transaction', '/profile'];
    const authRoutes = ['/login', '/register'];

    // Aturan untuk pengguna yang BELUM LOGIN
    if (!token) {
        // Jika mencoba mengakses halaman yang butuh login, alihkan ke /login
        if (adminOnlyRoutes.some(p => pathname.startsWith(p)) || userRoutesThatRequireLogin.some(p => pathname.startsWith(p))) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirectedFrom', pathname); // Opsional: untuk kembali setelah login
            return NextResponse.redirect(loginUrl);
        }
        // Izinkan akses ke semua halaman publik lainnya
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

        // Jika token tidak valid (misalnya, sudah kedaluwarsa)
        if (!response.ok) throw new Error('Invalid token');

        const { data: user } = await response.json();
        const isAdmin = user?.role === 'admin';

        // Jika sudah login, jangan biarkan mengakses halaman login/register lagi
        if (authRoutes.some(p => pathname.startsWith(p))) {
            return NextResponse.redirect(new URL(isAdmin ? '/dashboard' : '/', request.url));
        }

        // Aturan spesifik berdasarkan peran
        if (isAdmin) {
            // Jika admin mencoba mengakses halaman yang dilarang untuknya, alihkan ke dashboard
            if (adminForbiddenRoutes.includes(pathname)) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } else { // Jika BUKAN admin (adalah 'user')
            // Jika user mencoba mengakses halaman admin, alihkan ke halaman utama
            if (adminOnlyRoutes.some(p => pathname.startsWith(p))) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }

        // Jika semua aturan di atas tidak cocok, izinkan akses
        return NextResponse.next();

    } catch (error) {
        console.error('Middleware verification failed:', error);
        // Jika terjadi error saat verifikasi, hapus cookie dan alihkan ke halaman login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
    }
}

// Konfigurasi path mana saja yang akan dijalankan oleh middleware
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};
