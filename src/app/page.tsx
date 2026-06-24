'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Feed from '@/components/Feed';
import Widgets from '@/components/Widgets';
import BottomNav from '@/components/BottomNav';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
      } catch (e) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-gray-500 text-sm">Loading your experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 max-w-7xl mx-auto flex w-full">
      {/* Column 1: Sidebar */}
      <Sidebar currentUser={currentUser} />

      {/* Column 2: Feed */}
      <main className="flex-1 flex justify-center">
        <Feed currentUser={currentUser} />
      </main>

      {/* Column 3: Widgets */}
      <Widgets />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

