"use client";

import { useGetChatMessages } from "@/api/chats.api";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Chat } from "@/features/chat";
import type { ChatUIMessage } from "@/features/chat/chat.types";

interface ResizableChatLayoutProps {
  id: string;
}

export function ResizableChatLayout({ id }: ResizableChatLayoutProps) {
  const { data: chatMessages, isLoading } = useGetChatMessages({
    param: { id },
    query: { limit: "100" },
  });

  return (
    <ResizablePanelGroup className="h-full" direction="horizontal">
      <ResizablePanel defaultSize={100} minSize={20}>
        <Chat
          id={id}
          initialChatModel="gpt-4o-mini"
          initialMessages={chatMessages ? (chatMessages as ChatUIMessage[]) : []}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
