import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { UserProvider } from '@/context/user-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ProtectedRoute>
        <DashboardShell>{children}</DashboardShell>
      </ProtectedRoute>
    </UserProvider>
  );
}
