'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Feather, 
  Home, 
  Hash, 
  Bell, 
  Mail, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SidebarProps {
  currentUser: {
    id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
    profileImage?: any;
  } | null;
}

export default function Sidebar({ currentUser }: SidebarProps) {
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

  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Hash, label: 'Explore' },
    { icon: Bell, label: 'Notifications', badge: 3 },
    { icon: Mail, label: 'Messages' },
    { icon: User, label: 'Profile' },
  ];

  return (
    <aside className="hidden sm:flex w-20 md:w-64 flex-col justify-between h-screen sticky top-0 px-2 py-4 border-r border-gray-800 bg-gray-950/80 backdrop-blur-md z-20">
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold text-xl cursor-pointer hover:opacity-90 select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Feather className="w-5 h-5 text-white" />
          </div>
          <span className="hidden md:inline font-extrabold text-white">Chirp</span>
        </div>

        {/* Nav list */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group relative ${
                item.active 
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/60 border border-transparent'
              }`}
            >
              <item.icon className={`w-6 h-6 transition-transform group-hover:scale-105 ${item.active ? 'text-blue-400' : ''}`} />
              <span className="hidden md:inline font-semibold text-sm">{item.label}</span>
              
              {/* Notifications Badge */}
              {item.badge && (
                <span className="absolute left-7 top-2 md:left-auto md:right-4 md:top-1/2 md:-translate-y-1/2 w-4 h-4 bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] text-white flex items-center justify-center font-bold rounded-full border border-gray-950">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Chirp CTA for Desktop */}
        <button 
          onClick={() => {
            const el = document.getElementById('post-composer-textarea');
            if (el) el.focus();
          }}
          className="hidden md:flex w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl items-center justify-center gap-2 shadow-lg shadow-blue-500/15 hover:shadow-blue-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Chirp</span>
        </button>
      </div>

      {/* User Info & Logout Button */}
      {currentUser && (
        <div className="flex flex-col gap-2">
          {/* User profile row */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-800 bg-gray-900/40">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">@{currentUser.username}</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center md:justify-start gap-4 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all duration-200 font-semibold text-sm cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
