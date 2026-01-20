import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';

  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      cookie: cookieHeader,
    },
  });

  const response = NextResponse.json({ status: 'ok' }, { status: 200 });
  response.cookies.delete('demo_user');
  return response;
}
