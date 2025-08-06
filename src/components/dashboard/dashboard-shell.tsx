'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { RightPanel } from './right-panel';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1">
        <SidebarInset className="flex-1 flex flex-col">
          {children}
        </SidebarInset>
        <RightPanel />
      </div>
    </SidebarProvider>
  );
}
