'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarLink = {
  href: string;
  label: string;
  icon?: string;
};

type SidebarProps = {
  role: 'student' | 'teacher' | 'admin';
};

export const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();

  const links: Record<string, SidebarLink[]> = {
    student: [
      { href: '/dashboard/students', label: 'Dashboard' },
      { href: '/dashboard/students/courses', label: 'My Courses' },
      { href: '/certificates', label: 'Certificates' },
    ],
    teacher: [
      { href: '/dashboard/teachers', label: 'Dashboard' },
      { href: '/dashboard/teachers/create-course', label: 'Create Course' },
      { href: '/dashboard/teachers/courses', label: 'My Courses' },
    ],
    admin: [
      { href: '/dashboard/admin', label: 'Dashboard' },
      { href: '/dashboard/admin/users', label: 'Users' },
      { href: '/dashboard/admin/courses', label: 'Courses' },
    ],
  };

  const currentLinks = links[role] || [];

  return (
    <aside className="bg-white w-64 min-h-screen border-r border-gray-200 py-6">
      <nav className="space-y-1 px-4">
        {currentLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-md ${
              pathname === link.href
                ? 'bg-sky-50 text-sky-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
