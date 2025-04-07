import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import '@/styles/globals.css';
import Footer from '@/components/layout/footer';
import { poppins } from '@/utils/font';



export const metadata: Metadata = {
  title: 'Eduverse - Online Learning Platform',
  description: 'Discover a world of knowledge with Eduverse online learning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
