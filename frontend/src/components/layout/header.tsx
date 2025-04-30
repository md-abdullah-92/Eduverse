'use client';
import { useEffect, useState } from 'react';
import { jaro, poppins } from '@/utils/font';
import Navigation from '@/components/ui/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // ✅ Check if a token exists in localStorage
    const token = localStorage.getItem('token'); // or whatever key you use
    setIsLoggedIn(!!token);
  }, []);

  const isAuthPage = pathname === '/auth/login';

  return (
    <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo_t.png" alt="EduVerse Logo" className="h-10 w-auto" />
          <span className={`text-3xl font-bold text-sky-900 tracking-wide ${jaro.className}`}>
            EduVerse
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Right-side Auth/User */}
      <div className="flex items-center space-x-4">
        {isLoggedIn ?null : (
          !isAuthPage && (
            <>
              <Link
                href="/auth/login?tab=login"
                className={`bg-[#1A5B6D] text-white px-6 py-2 rounded-xl font-semibold text-base hover:bg-[#154C5B] transition-colors ${poppins.className}`}
              >
                Login
              </Link>
              <Link
                href="/auth/login?tab=register"
                className={`bg-[#1A5B6D] text-white px-6 py-2 rounded-xl font-semibold text-base hover:bg-[#154C5B] transition-colors ${poppins.className}`}
              >
                Get Started
              </Link>
            </>
          )
        )}
      </div>
    </header>
  );
};

export default Header;
