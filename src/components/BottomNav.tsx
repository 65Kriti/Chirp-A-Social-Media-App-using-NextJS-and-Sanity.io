'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, Hash, Bell, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BottomNav() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
        router.refresh();
      } else {
        toast.error('Failed to log out');
      }
    } catch (e) {
      toast.error('Something went wrong');
    }
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-950/85 backdrop-blur-lg border-t border-gray-800 flex justify-around items-center z-20 px-2 shadow-2xl">
      <button className="flex flex-col items-center justify-center text-blue-400 p-2 cursor-pointer">
        <Home className="w-5.5 h-5.5" />
      </button>
      <button className="flex flex-col items-center justify-center text-gray-500 hover:text-white p-2 cursor-pointer">
        <Hash className="w-5.5 h-5.5" />
      </button>
      <button className="flex flex-col items-center justify-center text-gray-500 hover:text-white p-2 relative cursor-pointer">
        <Bell className="w-5.5 h-5.5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full border border-gray-950" />
      </button>
      <button className="flex flex-col items-center justify-center text-gray-500 hover:text-white p-2 cursor-pointer">
        <User className="w-5.5 h-5.5" />
      </button>
      <button 
        onClick={handleLogout}
        className="flex flex-col items-center justify-center text-red-400 hover:text-red-300 p-2 cursor-pointer"
      >
        <LogOut className="w-5.5 h-5.5" />
      </button>
    </nav>
  );
}
