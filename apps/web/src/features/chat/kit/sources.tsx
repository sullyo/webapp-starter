"use client";

import { createContext, useContext } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

const SourceContext = createContext<{
  href: string;
  domain: string;
} | null>(null);

function useSourceContext() {
  const ctx = useContext(SourceContext);
  if (!ctx) throw new Error("Source.* must be used inside <Source>");
  return ctx;
}

export type SourceProps = {
  href: string;
  children: React.ReactNode;
};

export function Source({ href, children }: SourceProps) {
  let domain = "";
  try {
    domain = new URL(href).hostname;
  } catch {
    domain = href.split("/").pop() || href;
  }

  return (
    <SourceContext.Provider value={{ href, domain }}>
      <HoverCard closeDelay={0} openDelay={150}>
        {children}
      </HoverCard>
    </SourceContext.Provider>
  );
}

export type SourceTriggerProps = {
  label?: string | number;
  showFavicon?: boolean;
  className?: string;
};

export function SourceTrigger({ label, showFavicon = false, className }: SourceTriggerProps) {
  const { href, domain } = useSourceContext();
  const labelToShow = label ?? domain.replace("www.", "");

  return (
    <HoverCardTrigger asChild>
      <a
        className={cn(
          "inline-flex h-5 max-w-32 items-center gap-1 overflow-hidden rounded-full bg-muted py-0 text-muted-foreground text-xs leading-none no-underline transition-colors duration-150 hover:bg-muted-foreground/30 hover:text-primary",
          showFavicon ? "pr-2 pl-1" : "px-1",
          className
        )}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {showFavicon && (
          <img
            alt="favicon"
            className="size-3.5 rounded-full"
            height={14}
            src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(href)}`}
            width={14}
          />
        )}
        <span className="truncate text-center font-normal">{labelToShow}</span>
      </a>
    </HoverCardTrigger>
  );
}

export type SourceContentProps = {
  title: string;
  description: string;
  className?: string;
};

export function SourceContent({ title, description, className }: SourceContentProps) {
  const { href, domain } = useSourceContext();

  return (
    <HoverCardContent className={cn("w-80 p-0 shadow-xs", className)}>
      <a className="flex flex-col gap-2 p-3" href={href} rel="noopener noreferrer" target="_blank">
        <div className="flex items-center gap-1.5">
          <img
            alt="favicon"
            className="size-4 rounded-full"
            height={16}
            src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(href)}`}
            width={16}
          />
          <div className="truncate text-primary text-sm">{domain.replace("www.", "")}</div>
        </div>
        <div className="line-clamp-2 font-medium text-sm">{title}</div>
        <div className="line-clamp-2 text-muted-foreground text-sm">{description}</div>
      </a>
    </HoverCardContent>
  );
}
