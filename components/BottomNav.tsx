'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, BarChart3, Languages, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Feed', href: '/', icon: BookOpen },
    { name: 'Stats', href: '/stats', icon: BarChart3 },
    { name: 'Translator', href: '/translator', icon: Languages },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#161224] border-t border-[#2a2245] py-2 px-4 shadow-xl">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-[#A78BFA] bg-[#251f3d] scale-105 shadow-inner'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1f1a30]/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
