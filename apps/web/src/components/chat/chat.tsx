"use client";

import { useState, useEffect } from "react";
import type { Attachment, Message } from "ai";
import { useChat } from "@ai-sdk/react";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { MultimodalInput } from "./multi-modal-input";
import { customFetcher, chatUrl } from "@/lib/fetcher";
import { ChatHeader } from "@/components/chat/chat-header";
import { Messages } from "@/components/chat/messages";
import { useLocalStorage } from "usehooks-ts";
import { newIdWithoutPrefix } from "@repo/id";

export function Chat({
  id,
  initialMessages = [],
  isReadonly = false,
  isHomePage = false,
}: {
  id: string;
  initialMessages?: Array<Message>;
  isReadonly?: boolean;
  isHomePage?: boolean;
}) {
  const router = useRouter();
  const [localStorageInput, setLocalStorageInput] = useLocalStorage("input", "");
  const [selectedAgentId, setSelectedAgentId] = useLocalStorage<string>("selectedAgentId", "");

  const {
    messages,
    setMessages,
    handleSubmit: originalHandleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
    data,
  } = useChat({
    id,
    api: chatUrl,
    fetch: customFetcher,
    body: {
      agentId: selectedAgentId.length > 0 ? selectedAgentId : undefined,
    },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    onError: (error) => {
      toast.error("An error occurred, please try again!");
    },
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  const handleSubmit = async (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: any,
  ) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    if (isHomePage && input.trim()) {
      try {
        // Generate a random chat ID for demonstration
        // In a real app, this would come from your API
        const newChatId = newIdWithoutPrefix(10);

        setLocalStorageInput(input);
        // Navigate to the chat page with the new ID
        router.push(`/chat/${newChatId}`);

        return;
      } catch (error) {
        toast.error("Failed to create chat. Please try again.");
        return;
      }
    }

    // For existing chats, use the original handleSubmit
    return originalHandleSubmit(event, chatRequestOptions);
  };

  return (
    <>
      <div
        className={`flex min-w-0 flex-col bg-background ${isHomePage ? "h-auto" : "h-[calc(100dvh-40px)]"}`}
      >
        {!isHomePage && <ChatHeader chatId={id} />}

        {!isHomePage && (
          <Messages
            chatId={id}
            status={status}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
            isBlockVisible={false}
          />
        )}

        <form
          className={`mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-[790px] md:pb-6 ${isHomePage ? "pt-0" : ""}`}
        >
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
              isHomePage={isHomePage}
            />
          )}
        </form>
      </div>
    </>
  );
}
