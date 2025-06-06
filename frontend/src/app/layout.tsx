import Header from "@/components/layout/header";
import Providers from "@/components/layout/providers"; // ✅ new client component
import "@/styles/globals.css";
import { poppins } from "@/utils/font";
import { ReactNode } from "react";
// app/layout.tsx or app/page.tsx
import "easymde/dist/easymde.min.css";

export const metadata = {
  title: "Eduverse - Online Learning Platform",
  description:
    "Discover a world of knowledge with Eduverse online learning platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={poppins.className}>
        <Header />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
