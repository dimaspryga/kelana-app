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
    const cookieStore = cookies();
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
