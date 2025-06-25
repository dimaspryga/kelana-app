import { NextResponse } from 'next/server';
import axios from 'axios';


// Konfigurasi API terpusat
const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
  headers: {
    apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
    "Content-Type": "application/json",
  },
});

export async function GET(request) {

    const token = request.cookies.get('token')?.value;

    try {
        const response = await api.get('/promos', {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            }
        });
        return NextResponse.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Failed to fetch promos";
        return NextResponse.json({ message }, { status });
    }
}
