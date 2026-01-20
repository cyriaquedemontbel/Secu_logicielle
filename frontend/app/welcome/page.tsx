import Link from 'next/link';
import { cookies } from 'next/headers';

export default function WelcomePage() {
  const username = cookies().get('demo_user')?.value;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="card shadow-sm text-center">
          <h1 className="text-3xl font-bold text-black tracking-tight">
            {username ? `Welcome, ${username}` : 'Welcome'}
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            {username
              ? 'You are signed in.'
              : 'You are not signed in. Please return to the login page.'}
          </p>
          {!username && (
            <div className="mt-6">
              <Link className="btn-primary inline-flex" href="/login">
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
