import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  let username = '';
  let password = '';

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    username = String(body?.username || '');
    password = String(body?.password || '');
  } else {
    const form = await request.formData();
    username = String(form.get('username') || '');
    password = String(form.get('password') || '');
  }

  const backendResponse = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await backendResponse.json().catch(() => ({}));

  if (!backendResponse.ok) {
    return NextResponse.json(
      { detail: data?.detail || 'Invalid credentials' },
      { status: backendResponse.status },
    );
  }

  const response = NextResponse.json(data, { status: 200 });
  if (data?.username) {
    response.cookies.set('demo_user', data.username, {
      path: '/',
      sameSite: 'lax',
    });
  }
  return response;
}
