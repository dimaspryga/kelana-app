import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

// Konfigurasi API terpusat
const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
  headers: {
    apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
    "Content-Type": "application/json",
  },
});

export async function GET(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ message: "Already logged out" }, { status: 200 });
    }

    try {
        const response = await api.get('/logout', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        
        const res = NextResponse.json(response.data);

        res.cookies.delete('token');
        
        return res;

    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Logout failed";
        const res = NextResponse.json({ message }, { status });
        res.cookies.delete('token');
        return res;
    }
}

export async function POST(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ message: "No token found" }, { status: 400 });
    }

    try {
        const response = NextResponse.json({ message: "Logged out successfully" });
        
        // Clear the token cookie
        response.cookies.delete('token');
        
        return response;
    } catch (error) {
        return NextResponse.json({ message: "Logout failed" }, { status: 500 });
    }
}
