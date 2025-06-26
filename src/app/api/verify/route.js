import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    try {
        const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

        if (!API_KEY) {
            return NextResponse.json({ message: "API key not configured" }, { status: 500 });
        }

        const response = await axios.get(
            "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/user",
            {
                headers: {
                    apiKey: API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Token verification failed";
        return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
}