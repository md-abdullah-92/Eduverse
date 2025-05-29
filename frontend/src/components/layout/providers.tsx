'use client';

import { ReactNode } from "react";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import '@mantine/core/styles.css';

import { AuthProvider } from "@/app/auth/context";
import { ToastProvider } from "@/components/ui_elements/toast";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <ColorSchemeScript />
      <MantineProvider defaultColorScheme="light">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </MantineProvider>
    </>
  );
}
