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

export async function DELETE(request, { params }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    try {
        console.log('Delete cart API - Request:', { cartId: params.id });
        
        const response = await api.delete(`/carts/${params.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        
        console.log('Delete cart API - External response:', response.data);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Delete cart API - Error:', error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Failed to delete cart item";
        return NextResponse.json({ message }, { status });
    }
}
