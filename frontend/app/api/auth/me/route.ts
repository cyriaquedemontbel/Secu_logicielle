import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';

  const backendResponse = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      cookie: cookieHeader,
    },
  });

  const data = await backendResponse.json().catch(() => ({}));

  if (!backendResponse.ok) {
    return NextResponse.json(
      { detail: data?.detail || 'Not authenticated' },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(data, { status: 200 });
}
