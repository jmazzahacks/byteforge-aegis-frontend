'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [siteName, setSiteName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const storedSiteName = localStorage.getItem('site_name');

    if (!token) {
      router.push('/');
      return;
    }

    setSiteName(storedSiteName);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('site_id');
    localStorage.removeItem('site_name');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {siteName || 'Admin Dashboard'}
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to the Admin Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              User management features coming soon.
            </p>
            <div className="text-sm text-gray-500">
              <p>Planned features:</p>
              <ul className="mt-2 space-y-1">
                <li>- List users</li>
                <li>- View user details</li>
                <li>- Update user roles</li>
                <li>- Delete users</li>
                <li>- Resend verification emails</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
