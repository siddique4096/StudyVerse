
'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { DashboardHeader } from './dashboard-header';
import { ChatHistoryProvider } from '@/context/chat-history-provider';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col">
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <div className="flex flex-1 flex-col overflow-y-auto">
             <DashboardHeader />
             <ChatHistoryProvider>{children}</ChatHistoryProvider>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
