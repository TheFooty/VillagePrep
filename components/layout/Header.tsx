'use client';

import { User } from '@/types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onGetStarted: () => void;
}

export function Header({ user, onLogout, onGetStarted }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <span className="text-white font-semibold">VillagePrep</span>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-400 text-sm">{user.email}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#14b8a6]/20 text-[#14b8a6] text-xs">{user.role}</span>
            <button onClick={onLogout} className="text-gray-400 hover:text-white text-sm">Sign out</button>
          </>
        ) : (
          <button onClick={onGetStarted} className="text-[#14b8a6] hover:text-white text-sm">Get Started</button>
        )}
      </div>
    </header>
  );
}