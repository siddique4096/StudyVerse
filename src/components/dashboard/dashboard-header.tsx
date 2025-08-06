'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Book, Bot, MessageSquare } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      path: '/dashboard',
      label: 'Subjects',
      icon: Book,
      matcher: (path: string) => path === '/dashboard' || path.startsWith('/dashboard/subject'),
    },
    {
        path: '/dashboard/studybot',
        label: 'StudyBot',
        icon: Bot,
        matcher: (path: string) => path.startsWith('/dashboard/studybot'),
    },
    {
      path: '/dashboard/chat',
      label: 'Group Chat',
      icon: MessageSquare,
      matcher: (path: string) => path.startsWith('/dashboard/chat'),
    },
  ];

  return (
    <header className="flex-shrink-0 border-b bg-background px-4 py-2 sm:px-6">
      <div className="flex items-center justify-start gap-2">
        <SidebarTrigger className="h-7 w-7" />
        <nav className="flex items-center space-x-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={item.matcher(pathname) ? 'secondary' : 'ghost'}
              onClick={() => router.push(item.path)}
              className="px-3"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
