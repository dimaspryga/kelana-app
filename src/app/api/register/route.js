import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, email, password, passwordRepeat, phoneNumber, role } = await req.json();


    const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

    if (!API_KEY) {
      return NextResponse.json({ message: 'API key not configured' }, { status: 500 });
    }

    const payload = {
      name,
      email,
      password,
      passwordRepeat,
      phoneNumber,
      role,
    };

    const response = await fetch("https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apiKey": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Proxy API error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred", error: error.message },
      { status: 500 }
    );
  }
}