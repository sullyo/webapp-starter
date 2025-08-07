"use client";

import { AlertTriangle } from "lucide-react";
import { memo, useRef } from "react";
import type { ChatUIMessage } from "@/features/chat/chat.types";
import { ChatContainerContent, ChatContainerRoot } from "@/features/chat/kit/chat-container";
import { Loader } from "@/features/chat/kit/loader";
import { Message } from "@/features/chat/kit/message";
import { Message as MessageWrapper } from "@/features/chat/message";

import { ScrollButton } from "./kit/scroll-button";

type ConversationProps = {
  messages: ChatUIMessage[];
  status?: "streaming" | "ready" | "submitted" | "error";
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onReload: () => void;
  error?: Error;
};

const LoadingMessage = memo(() => (
  <Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-2 md:px-10">
    <div className="group flex w-full flex-col gap-0">
      <div className="prose w-full min-w-0 flex-1 rounded-lg bg-transparent p-0 text-foreground">
        <Loader variant="typing" />
      </div>
    </div>
  </Message>
));

LoadingMessage.displayName = "LoadingMessage";

const ErrorMessage = memo(({ error }: { error: Error }) => (
  <Message className="not-prose mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-0 md:px-10">
    <div className="group flex w-full flex-col items-start gap-0">
      <div className="flex min-w-0 flex-1 flex-row items-center gap-2 rounded-lg border border-destructive bg-destructive/10 px-2 py-1 text-primary">
        <AlertTriangle className="text-destructive" size={16} />
        <p className="text-destructive">{error.message}</p>
      </div>
    </div>
  </Message>
));

ErrorMessage.displayName = "ErrorMessage";

export function Conversation({
  messages,
  status = "ready",
  onDelete,
  onEdit,
  onReload,
  error,
}: ConversationProps) {
  const initialMessageCount = useRef(messages.length);

  if (!messages || messages.length === 0) return <div className="h-full w-full"></div>;
  const lastAssistantMessage = messages.findLast((message) => message.role === "assistant");
  const isLoading = status === "submitted" || lastAssistantMessage?.parts.length === 0;

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
            const isLast = index === messages.length - 1;
            const hasScrollAnchor = isLast && messages.length > initialMessageCount.current;

            return (
              <MessageWrapper
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
          {isLoading && status !== "error" && <LoadingMessage />}
          {status === "error" && error && <ErrorMessage error={error} />}
          <div className="absolute bottom-0 flex w-full max-w-3xl flex-1 items-end justify-end gap-4 px-6 pb-2">
            <ScrollButton className="absolute top-[-50px] right-[30px]" />
          </div>
        </ChatContainerContent>
      </ChatContainerRoot>
    </div>
  );
}
