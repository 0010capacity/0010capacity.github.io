'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { novelsApi, blogApi, appsApi } from '@/lib/api';
import { Novel, BlogPost, App } from '@/lib/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [novelCount, setNovelCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');

    if (!storedToken || !storedUser) {
      router.push('/admin/login');
      return;
    }

    setToken(storedToken);
    setUser(JSON.parse(storedUser));

    // Fetch counts
    const fetchCounts = async () => {
      try {
        const novels: Novel[] = await novelsApi.list({ limit: 1, offset: 0 });
        const blogs: BlogPost[] = await blogApi.list({ limit: 1, offset: 0 });
        const apps: App[] = await appsApi.list({ limit: 1, offset: 0 });

        setNovelCount(Array.isArray(novels) ? novels.length : 0);
        setBlogCount(Array.isArray(blogs) ? blogs.length : 0);
        setAppCount(Array.isArray(apps) ? apps.length : 0);
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Welcome, {user.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Novels Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Total Novels</p>
                <p className="text-3xl font-bold">{loading ? '-' : novelCount}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
            <Link
              href="/admin/novels"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Manage Novels →
            </Link>
          </div>

          {/* Blog Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Total Blog Posts</p>
                <p className="text-3xl font-bold">{loading ? '-' : blogCount}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
            <Link
              href="/admin/blog"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Manage Blog →
            </Link>
          </div>

          {/* Apps Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Total Apps</p>
                <p className="text-3xl font-bold">{loading ? '-' : appCount}</p>
              </div>
              <div className="text-4xl">📱</div>
            </div>
            <Link
              href="/admin/apps"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Manage Apps →
            </Link>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Create Novel */}
            <Link
              href="/admin/novels/new"
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 hover:border-gray-500 transition-all"
            >
              <div className="text-2xl mb-2">📚</div>
              <p className="font-semibold">Create Novel</p>
              <p className="text-sm text-gray-400">Add a new novel</p>
            </Link>

            {/* Create Blog Post */}
            <Link
              href="/admin/blog/new"
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 hover:border-gray-500 transition-all"
            >
              <div className="text-2xl mb-2">📝</div>
              <p className="font-semibold">Create Blog Post</p>
              <p className="text-sm text-gray-400">Write a new article</p>
            </Link>

            {/* Create App */}
            <Link
              href="/admin/apps/new"
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 hover:border-gray-500 transition-all"
            >
              <div className="text-2xl mb-2">📱</div>
              <p className="font-semibold">Create App</p>
              <p className="text-sm text-gray-400">Add a new app</p>
            </Link>
          </div>
        </div>

        {/* Back to Site */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            ← Back to Site
          </Link>
        </div>
      </div>
    </div>
  );
}
