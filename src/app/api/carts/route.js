import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

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
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    try {
        const response = await api.get('/carts', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return NextResponse.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Failed to fetch cart data";
        return NextResponse.json({ message }, { status });
    }
}
