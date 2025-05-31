import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {

    const { email, password } = await req.json();

        const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

    if (!API_KEY) {
      return NextResponse.json({ message: 'API key not configured' }, { status: 500 });
    }

    const response = await axios.post(
      "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/login",
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
          apiKey: API_KEY,
        },
      }
    );

    const data = response.data;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Terjadi kesalahan saat login";
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}
