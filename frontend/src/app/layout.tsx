import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { ToastProvider } from "@/components/ui/toast";
import "@/styles/globals.css";
import { poppins } from "@/utils/font";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eduverse - Online Learning Platform",
  description:
    "Discover a world of knowledge with Eduverse online learning platform",
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
        <ToastProvider>{children}</ToastProvider>
        <Footer />
      </body>
    </html>
  );
}
