'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { DashboardHeader } from './dashboard-header';
import { ChatHistoryProvider } from '@/context/chat-history-provider';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-y-auto">
            <ChatHistoryProvider>{children}</ChatHistoryProvider>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
