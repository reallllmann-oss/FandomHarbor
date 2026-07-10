"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useState, type PropsWithChildren } from "react";

export type AppTheme = "dark" | "light";

export function useAppTheme() {
  const { resolvedTheme, setTheme: setNextTheme } = useTheme();

  return {
    resolvedTheme:
      resolvedTheme === "dark" || resolvedTheme === "light"
        ? resolvedTheme
        : undefined,
    setTheme(theme: AppTheme) {
      setNextTheme(theme);
    },
  };
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextThemesProvider>
  );
}
