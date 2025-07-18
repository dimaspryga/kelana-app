import { NextResponse } from 'next/server';
import axios from 'axios';

const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
  headers: {
    apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
    "Content-Type": "application/json",
  },
});

export async function GET(request, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ message: "Category ID is required" }, { status: 400 });
  }

  try {
    const response = await api.get(`/activities-by-category/${id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || `Failed to fetch activities for category id: ${id}`;
    return NextResponse.json({ message }, { status });
  }
}
