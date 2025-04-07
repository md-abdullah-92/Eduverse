'use client';
import { jaro,poppins } from '@/utils/font';
import { poltawskiNowy } from '@/utils/font';
import Link from 'next/link';
//import { UserAvatar } from '@/components/ui/UserAvatar';

/*type User = {
  name?: string;
  image?: string;
  role?: 'student' | 'teacher' | 'admin';
};
*/
const Header = () => {
  const isLoggedIn = false;
  //const user: User | null = null;

  return (
    <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="EduVerse Logo" className="h-10 w-auto" />
          <span className={`text-3xl font-bold text-sky-900 tracking-wide ${jaro.className}`}>
          EduVerse</span>

        </Link>
      </div>

      {/* Navigation */}
     
      <nav className={`hidden md:flex items-center space-x-6 text-[18px] font-medium text-[#6A6B6C] ${poltawskiNowy.className}`}>
        <Link href="/" className="hover:text-sky-800 transition-colors">Home</Link>
        <Link href="/courses" className="hover:text-sky-800 transition-colors">Course</Link>
        <Link href="/monitors" className="hover:text-sky-800 transition-colors">Monitors</Link>
        <Link href="/about" className="hover:text-sky-800 transition-colors">About</Link>
      </nav>

      {/* Right-side Auth/User */}
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard/students" className="text-gray-700 hover:text-sky-800 text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/settings" className="hover:opacity-80">
            { /*<UserAvatar name={user?.name || 'User'} image={user?.image} size="sm" />*/}
            </Link>
          </>
        ) : (
        <>
        <Link
        href="/auth/login"
        className={`bg-[#1A5B6D] text-white px-6 py-2 rounded-xl font-semibold text-base hover:bg-[#154C5B] transition-colors ${poppins.className}`}
        >
         Login
        </Link>

        <Link
        href="/auth/register"
        className={`bg-[#1A5B6D] text-white px-6 py-2 rounded-xl font-semibold text-base hover:bg-[#154C5B] transition-colors ${poppins.className}`}
        >
        Get Started
        </Link>
        </>
        )}
      </div>
    </header>
  );
};

export default Header;
