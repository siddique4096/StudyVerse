import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { UserProvider } from '@/context/user-provider';
import { ChatHistoryProvider } from '@/context/chat-history-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ProtectedRoute>
        <ChatHistoryProvider>
          <DashboardShell>{children}</DashboardShell>
        </ChatHistoryProvider>
      </ProtectedRoute>
    </UserProvider>
  );
}
