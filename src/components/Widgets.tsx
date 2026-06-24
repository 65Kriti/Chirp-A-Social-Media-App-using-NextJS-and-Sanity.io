'use client';

import React from 'react';
import { Search, TrendingUp, UserPlus, Trophy } from 'lucide-react';

export default function Widgets() {
  const trends = [
    { category: 'Development • Trending', topic: '#NextJS15', posts: '24.5K Chirps' },
    { category: 'Technology • Trending', topic: '#TailwindCSS', posts: '12.8K Chirps' },
    { category: 'Database • Trending', topic: '#SanityIO', posts: '8.4K Chirps' },
    { category: 'AI • Trending', topic: '#DeepMind', posts: '142K Chirps' },
  ];

  const suggestions = [
    { name: 'Sarah Connor', username: 'sarah_c', tag: 'Tech Enthusiast' },
    { name: 'Bruce Wayne', username: 'batman', tag: 'Night Watcher' },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-80 h-screen sticky top-0 px-4 py-4 overflow-y-auto bg-gray-950/40 border-l border-gray-800">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search Chirp..."
          className="w-full pl-11 pr-4 py-2.5 bg-gray-900/60 border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
        />
      </div>

      {/* Trending Box */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-gray-800/60 pb-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">What's Happening</h2>
        </div>
        <div className="flex flex-col gap-3">
          {trends.map((trend) => (
            <div key={trend.topic} className="group cursor-pointer select-none">
              <p className="text-[10px] text-gray-500 font-semibold">{trend.category}</p>
              <p className="text-sm font-bold text-gray-200 mt-0.5 group-hover:text-blue-400 transition-colors">
                {trend.topic}
              </p>
              <p className="text-[11px] text-gray-550 mt-0.5">{trend.posts}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Who to Follow */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-gray-800/60 pb-2">
          <Trophy className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Who to Follow</h2>
        </div>
        <div className="flex flex-col gap-3.5">
          {suggestions.map((user) => (
            <div key={user.username} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight hover:underline cursor-pointer">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">@{user.username}</p>
                </div>
              </div>
              <button className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-200 text-gray-950 font-bold text-[11px] rounded-full transition-colors whitespace-nowrap cursor-pointer">
                <UserPlus className="w-3 h-3" />
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="px-4 text-[11px] text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
        <span className="hover:underline cursor-pointer">Terms of Service</span>
        <span className="hover:underline cursor-pointer">Privacy Policy</span>
        <span className="hover:underline cursor-pointer">Cookie Policy</span>
        <span>© 2026 Chirp Corp.</span>
      </div>

    </aside>
  );
}
