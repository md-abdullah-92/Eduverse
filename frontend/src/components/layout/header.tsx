'use client';
import { jaro, poppins } from '@/utils/font';
import Navigation  from '@/components/ui/navigation';
import Link from 'next/link';
//import { usePathname, useSearchParams } from 'next/navigation';
import { usePathname} from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  //const searchParams = useSearchParams();
  //const tab = searchParams.get('tab');

  const isAuthPage = pathname === '/auth/login';
  //const isLoginTab = tab === 'login' || tab === null; // default to login
  //const isRegisterTab = tab === 'register';

  const isLoggedIn = false;

  return (
    <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="EduVerse Logo" className="h-10 w-auto" />
          <span className={`text-3xl font-bold text-sky-900 tracking-wide ${jaro.className}`}>
            EduVerse
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Right-side Auth/User */}
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard/students" className="text-gray-700 hover:text-sky-800 text-sm font-medium">
              Dashboard
            </Link>
          </>
        ) : (
          <>
            {/* Only show Login if not already on login tab */}
            {(!isAuthPage ) && (
              <Link
                href="/auth/login?tab=login"
                className={`bg-[#1A5B6D] text-white px-6 py-2 rounded-xl font-semibold text-base hover:bg-[#154C5B] transition-colors ${poppins.className}`}
              >
                Login
              </Link>
            )}

            {/* Only show Register if not already on register tab */}
            {(!isAuthPage ) && (
              <Link
                href="/auth/login?tab=register"
                className={`bg-[#1A5B6D] text-white px-6 py-2 rounded-xl font-semibold text-base hover:bg-[#154C5B] transition-colors ${poppins.className}`}
              >
                Get Started
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
