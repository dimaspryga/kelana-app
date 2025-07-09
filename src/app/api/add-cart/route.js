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

export async function POST(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    try {
        const body = await request.json();
        console.log('Add cart API - Request body:', body);
        
        const response = await api.post('/carts', body, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        
        console.log('Add cart API - External response:', response.data);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Add cart API - Error:', error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Failed to add item to cart";
        return NextResponse.json({ message }, { status });
    }
}
