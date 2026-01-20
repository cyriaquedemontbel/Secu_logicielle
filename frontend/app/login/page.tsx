'use client';

import { useState } from 'react';

type StatusKind = 'idle' | 'success' | 'error';

type StatusState = {
  kind: StatusKind;
  message: string;
};

export default function LoginPage() {
  const [status, setStatus] = useState<StatusState>({
    kind: 'idle',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus({ kind: 'idle', message: '' });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: formData,
      });

      const message = await response.text();

      if (response.ok) {
        setStatus({
          kind: 'success',
          message: message || 'HIGH: Demo credentials accepted.',
        });
      } else {
        setStatus({
          kind: 'error',
          message: message || 'Invalid credentials.',
        });
      }
    } catch (error) {
      setStatus({
        kind: 'error',
        message: 'Login request failed. Is the server running?',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusClass =
    status.kind === 'success'
      ? 'severity-high'
      : status.kind === 'error'
        ? 'bg-gray-100 border border-gray-300 text-gray-800'
        : '';

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="card shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-black tracking-tight">Demo Login</h1>
            <p className="text-sm text-gray-500 mt-2">
              This page is intentionally insecure for lab testing.
            </p>
          </div>

          <form onSubmit={handleSubmit} method="post" action="/api/login" className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="demo"
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="demo"
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            {status.kind !== 'idle' && (
              <div className={`rounded-md px-4 py-3 text-sm ${statusClass}`}>
                <p className="font-semibold">{status.kind === 'success' ? 'HIGH' : 'Login failed'}</p>
                <p>{status.message}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-500">
            Use <span className="font-semibold">demo / demo</span> to trigger the HIGH warning.
          </div>
        </div>

        <div className="hidden" aria-hidden="true">
          <form method="post" action="/api/login">
            <input type="text" name="username" defaultValue="testuser" />
            <input type="password" name="password" defaultValue="testpass" />
          </form>
          <form method="post" action="/api/login">
            <input type="email" name="email" defaultValue="user@example.com" />
            <input type="password" name="password" defaultValue="password" />
          </form>
          <form method="post" action="/api/login">
            <input type="text" name="login" defaultValue="admin" />
            <input type="password" name="password" defaultValue="admin" />
          </form>
        </div>
      </div>
    </div>
  );
}
