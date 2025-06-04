'use client';

import { ReactNode, useEffect, useState } from "react";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import '@mantine/core/styles.css';

import { AuthProvider } from "@/app/auth/context";
import { ToastProvider } from "@/components/ui_elements/toast";

export default function Providers({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mantine-color-scheme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved) {
      setColorScheme(saved);
    } else {
      setColorScheme(prefersDark ? 'dark' : 'light');
    }
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <>
      <ColorSchemeScript defaultColorScheme={colorScheme} />
      <MantineProvider defaultColorScheme={colorScheme}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </MantineProvider>
    </>
  );
}
