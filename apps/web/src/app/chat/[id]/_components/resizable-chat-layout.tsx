"use client";

import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Chat } from "@/features/chat";

interface ResizableChatLayoutProps {
  id: string;
}

export function ResizableChatLayout({ id }: ResizableChatLayoutProps) {
  return (
    <ResizablePanelGroup className="h-full" direction="horizontal">
      <ResizablePanel defaultSize={100} minSize={20}>
        <Chat id={id} initialChatModel="gpt-4o-mini" initialMessages={[]} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
