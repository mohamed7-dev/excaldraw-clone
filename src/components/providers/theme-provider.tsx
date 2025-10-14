"use client";
import React from "react";
import dynamic from "next/dynamic";

const NextThemeProvider = dynamic(
  () => import("next-themes").then((m) => m.ThemeProvider),
  { ssr: false }
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </NextThemeProvider>
  );
}
