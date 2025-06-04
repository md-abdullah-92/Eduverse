import { ReactNode } from "react";
import { poppins } from "@/utils/font";
import "@/styles/globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Providers from "@/components/layout/providers"; // ✅ new client component
// app/layout.tsx or app/page.tsx
import 'easymde/dist/easymde.min.css';


export const metadata = {
  title: "Eduverse - Online Learning Platform",
  description: "Discover a world of knowledge with Eduverse online learning platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={poppins.className}>
        <Header />
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}
