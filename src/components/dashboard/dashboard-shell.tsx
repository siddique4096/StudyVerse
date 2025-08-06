'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { DashboardHeader } from './dashboard-header';
import { ChatHistoryProvider } from '@/context/chat-history-provider';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <SidebarInset className="flex-1 flex flex-col overflow-y-auto">
          <ChatHistoryProvider>{children}</ChatHistoryProvider>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
