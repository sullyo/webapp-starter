"use client";

import { memo, useMemo, useState } from "react";

import type { ChatRequestOptions, Message } from "ai";
import { cx } from "class-variance-authority";
import equal from "fast-deep-equal";

import { cn } from "@/lib/utils";

import { Pencil, Sparkle } from "lucide-react";
import { Message as PromptMessage, MessageContent } from "@/components/chat/kit/message";
import { RenderToolInvocation } from "@/components/chat/tool-message";
import { MessageReasoning } from "@/components/chat/message-reasoning";

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <div className="group/message mx-auto w-full max-w-3xl px-4" data-role={message.role}>
      <div
        className={cn(
          "flex w-full gap-4 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
          {
            "w-full": mode === "edit",
            "group-data-[role=user]/message:w-fit": mode !== "edit",
          },
        )}
      >
        <div className="flex w-full flex-col gap-4">
          {message.experimental_attachments && (
            <div className="flex flex-row justify-end gap-2">
              {message.experimental_attachments.map((attachment) => (
                <div key={attachment.url}>Attachment</div>
                // <PreviewAttachment key={attachment.url} attachment={attachment} />
              ))}
            </div>
          )}
          {message.parts?.map((part, index) => {
            const messageKey = `${message.id}-${part.type}-${index}`;
            if (part.type === "text") {
              return (
                <div className="flex flex-row items-start gap-2" key={messageKey}>
                  {message.role === "user" && (
                    <PromptMessage className="justify-end" key={`${messageKey}-user`}>
                      <MessageContent className="text-[15px]">{part.text}</MessageContent>
                    </PromptMessage>
                  )}
                  {message.role === "assistant" && (
                    <PromptMessage className="justify-start" key={`${messageKey}-assistant`}>
                      <MessageContent markdown className="bg-transparent p-0 text-[15px] ">
                        {part.text}
                      </MessageContent>
                    </PromptMessage>
                  )}
                </div>
              );
            }
            if (part.type === "reasoning") {
              return (
                <MessageReasoning
                  isLoading={isLoading}
                  reasoning={part.reasoning}
                  key={messageKey}
                />
              );
            }
            if (part.type === "tool-invocation") {
              return (
                <RenderToolInvocation
                  toolInvocation={part.toolInvocation}
                  isLoading={isLoading}
                  key={messageKey}
                />
              );
            }
            if (part.type === "source") {
              return <div key={messageKey}>SourcePartRenderer</div>;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export const PreviewMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;

  if (prevProps.message.content !== nextProps.message.content) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

  return true;
});

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <div className="group/message mx-auto w-full max-w-3xl px-4" data-role={role}>
      <div
        className={cx(
          "flex w-full gap-4 rounded-xl group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:px-3 group-data-[role=user]/message:py-2",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-4 text-[15px] text-muted-foreground">Thinking...</div>
        </div>
      </div>
    </div>
  );
};
