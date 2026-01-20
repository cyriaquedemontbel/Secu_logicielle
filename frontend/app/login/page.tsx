'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type StatusKind = 'idle' | 'success' | 'error';

type StatusState = {
  kind: StatusKind;
  message: string;
};

export default function LoginPage() {
  const router = useRouter();
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setStatus({
          kind: 'success',
          message: 'Login successful.',
        });
        router.push('/welcome');
      } else {
        setStatus({
          kind: 'error',
          message: data?.detail || 'Invalid credentials.',
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
      ? 'bg-green-50 border border-green-200 text-green-800'
      : status.kind === 'error'
        ? 'bg-gray-100 border border-gray-300 text-gray-800'
        : '';

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="card shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-black tracking-tight">Login</h1>
            <p className="text-sm text-gray-500 mt-2">Sign in to continue.</p>
          </div>

          <form onSubmit={handleSubmit} method="post" action="/api/auth/login" className="space-y-5">
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
                <p className="font-semibold">{status.kind === 'success' ? 'Success' : 'Login failed'}</p>
                <p>{status.message}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
