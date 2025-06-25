import { NextResponse } from 'next/server';
import axios from 'axios';

const LOGIN_API_URL = "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/login";
const USER_API_URL = "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/user";
const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Langkah 1: Panggil API login eksternal untuk mendapatkan token
    const loginResponse = await axios.post(LOGIN_API_URL, 
      { email, password },
      { headers: { 'apiKey': API_KEY, 'Content-Type': 'application/json' } }
    );

    const token = loginResponse.data?.data?.token || loginResponse.data?.token;

    if (!token) {
      return NextResponse.json({ message: "Login successful, but no token was returned from the service." }, { status: 500 });
    }

    // Langkah 2: Gunakan token baru untuk mengambil data pengguna
    const userResponse = await axios.get(USER_API_URL, {
        headers: { 
            apiKey: API_KEY, 
            Authorization: `Bearer ${token}` 
        }
    });

    const user = userResponse.data.data;

    if (!user) {
        return NextResponse.json({ message: "Could not retrieve user details after login." }, { status: 500 });
    }

    // Langkah 3: Buat respons JSON yang akan dikirim kembali ke browser
    // FIX: Sertakan 'token' dan 'user' di dalam body respons
    const response = NextResponse.json({
        message: "Login successful",
        token: token, // <-- Kunci perbaikan ada di sini
        user: user
    });

    // Langkah 4: Atur cookie di header respons
    response.cookies.set('token', token, {
        httpOnly: false, 
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 minggu
    });

    return response;

  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || "An error occurred during the login process.";
    return NextResponse.json({ message: message }, { status: status });
  }
}
