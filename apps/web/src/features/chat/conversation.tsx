"use client";

import { useRef } from "react";
import type { ChatUIMessage } from "@/features/chat/chat.types";
import { ChatContainerContent, ChatContainerRoot } from "@/features/chat/kit/chat-container";
import { Loader } from "@/features/chat/kit/loader";
import { ScrollButton } from "./kit/scroll-button";
import { Message } from "./message";

type ConversationProps = {
  messages: ChatUIMessage[];
  status?: "streaming" | "ready" | "submitted" | "error";
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onReload: () => void;
};

export function Conversation({
  messages,
  status = "ready",
  onDelete,
  onEdit,
  onReload,
}: ConversationProps) {
  const initialMessageCount = useRef(messages.length);

  if (!messages || messages.length === 0) return <div className="h-full w-full"></div>;

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-y-auto overflow-x-hidden">
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 mx-auto flex w-full flex-col justify-center">
        <div className="flex h-app-header w-full bg-background lg:hidden lg:h-0" />
        <div className="mask-b-from-4% mask-b-to-100% flex h-app-header w-full bg-background lg:hidden" />
      </div>
      <ChatContainerRoot className="relative w-full">
        <ChatContainerContent
          className="flex w-full flex-col items-center pt-20 pb-4"
          style={{
            scrollbarGutter: "stable both-edges",
            scrollbarWidth: "none",
          }}
        >
          {messages?.map((message, index) => {
            const isLast = index === messages.length - 1 && status !== "submitted";
            const hasScrollAnchor = isLast && messages.length > initialMessageCount.current;

            return (
              <Message
                hasScrollAnchor={hasScrollAnchor}
                id={message.id}
                isLast={isLast}
                key={message.id}
                onDelete={onDelete}
                onEdit={onEdit}
                onReload={onReload}
                parts={message.parts}
                status={status}
                variant={message.role}
              />
            );
          })}
          {status === "submitted" && messages.length > 0 && messages.at(-1)?.role === "user" && (
            <div className="group flex min-h-scroll-anchor w-full max-w-3xl flex-col items-start gap-2 px-6 pb-2">
              <Loader variant="typing" />
            </div>
          )}
          <div className="absolute bottom-0 flex w-full max-w-3xl flex-1 items-end justify-end gap-4 px-6 pb-2">
            <ScrollButton className="absolute top-[-50px] right-[30px]" />
          </div>
        </ChatContainerContent>
      </ChatContainerRoot>
    </div>
  );
}
