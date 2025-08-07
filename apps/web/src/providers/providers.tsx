"use client";

import type { ThemeProviderProps } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider {...props}>
      <QueryProvider>
        <TooltipProvider delayDuration={320}>{children}</TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
