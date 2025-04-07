'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This would come from your auth context/state
  const userRole = 'student'; // or 'teacher' or 'admin'
  const userName = 'John Doe'; // This would come from your auth context

  return (
    <div className="flex min-h-screen">
      <Sidebar role={userRole as 'student' | 'teacher' | 'admin'} />
      <div className="flex-1">
        <div className="border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-end">
            <UserAvatar name={userName} size="sm" />
          </div>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
