"use client";

import { cn } from "@/lib/utils";
import React from "react";

export interface LoaderProps {
  variant?: "loading-dots";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function TextDotsLoader({
  className,
  text = "Thinking",
  size = "md",
}: {
  className?: string;
  text?: string;
  size?: "sm" | "md" | "lg";
}) {
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("inline-flex items-center", className)}>
      <span className={cn("font-base text-primary", textSizes[size])}>{text}</span>
      <span className="inline-flex">
        <span className="animate-[loading-dots_1.4s_infinite_0.2s] text-primary">.</span>
        <span className="animate-[loading-dots_1.4s_infinite_0.4s] text-primary">.</span>
        <span className="animate-[loading-dots_1.4s_infinite_0.6s] text-primary">.</span>
      </span>
    </div>
  );
}

function Loader({ size = "md", text, className }: LoaderProps) {
  return <TextDotsLoader text={text} size={size} className={className} />;
}

export { Loader };
