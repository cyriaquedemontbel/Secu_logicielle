'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';

type ProfileState = {
  username: string;
  displayName: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/auth/me');

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Not authenticated' }));
          throw new ApiError(response.status, errorData.detail || 'Not authenticated');
        }

        const data = await response.json();
        setProfile({ username: data.username, displayName: data.display_name });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Unable to load profile.');
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-black mb-4">Profile</h1>
        {error ? (
          <div className="bg-gray-100 border border-gray-300 text-gray-800 px-4 py-3 rounded-md">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : profile ? (
          <>
            <p className="text-sm text-gray-600 mb-2">Signed in as:</p>
            <div className="text-lg font-semibold text-black">{profile.displayName}</div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Chargement du profil...</p>
        )}
      </div>
    </div>
  );
}
