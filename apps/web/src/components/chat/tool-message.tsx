"use client";

import { Check, Loader2 } from "lucide-react";

import { ToolInvocation } from "ai";

export function ToolStatus({ text, isLoading }: { text: string; isLoading: boolean }) {
  return (
    <div className="flex max-w-[250px] flex-row items-center gap-2 rounded-md bg-muted px-3 py-1.5">
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
      <div className="text-sm">{text}</div>
    </div>
  );
}

export function RenderToolInvocation({
  toolInvocation,
  isLoading,
}: { toolInvocation: ToolInvocation; isLoading: boolean }) {
  const { toolName, toolCallId, state } = toolInvocation;

  if (state === "call") {
    const { args } = toolInvocation;
    if (toolName === "search-web") {
      return <ToolStatus text="Searching web" isLoading={true} />;
    }
    if (toolName === "get-weather") {
      return <ToolStatus text="Getting weather" isLoading={true} />;
    }
    return null;
  }

  if (state === "result") {
    const { result } = toolInvocation;
    if (toolName === "search-web") {
      // const { result } = result as { result: string };
      return <ToolStatus text={`Got web search results`} isLoading={false} />;
    }
    if (toolName === "get-weather") {
      // const { result } = result as { result: string };
      return <ToolStatus text={`Got weather`} isLoading={false} />;
    }
  }

  return null;
}
