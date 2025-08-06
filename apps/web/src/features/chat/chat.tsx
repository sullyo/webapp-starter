"use client";

import { useChat } from "@ai-sdk/react";
import { newIdWithoutPrefix } from "@repo/id";
import { DefaultChatTransport } from "ai";
import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ChatInput,
  Conversation,
  useChatDraft,
  useChatFileUpload,
  useChatHandlers,
} from "@/features/chat";
import { chatUrl, customFetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

import type { ChatUIMessage } from "./chat.types";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
}: {
  id: string | null;
  initialMessages: ChatUIMessage[];
  initialChatModel: string;
}) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [input, setInput] = useState("");
  const { clearDraft, getDraft } = useChatDraft(id);

  const {
    files,
    setFiles,
    handleFileUploads,
    createOptimisticAttachments,
    cleanupOptimisticAttachments,
    handleFileUpload,
    handleFileRemove,
  } = useChatFileUpload();
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const { messages, sendMessage, status, setMessages, reload, stop } = useChat({
    id: id ?? undefined,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: chatUrl,
      fetch: customFetcher as typeof fetch,
      prepareRequest: ({ messages }) => {
        return {
          body: {
            message: messages[messages.length - 1],
            chatId: id,
            model: selectedModel,
          },
        };
      },
    }),
    dataPartSchemas: chatDataPartSchemas,
    onError: (error) => {
      if (error) {
        let errorMsg = "Something went wrong.";
        try {
          const parsed = JSON.parse(error.message);
          errorMsg = parsed.error || errorMsg;
        } catch {
          errorMsg = error.message || errorMsg;
        }
        toast.error(errorMsg);
      }
    },
  });

  const { handleInputChange, handleModelChange, handleDelete, handleEdit } = useChatHandlers({
    messages,
    setMessages,
    setInput,
    setSelectedModel,
    selectedModel,
    chatId: id,
  });

  const submit = async () => {
    setIsSubmitting(true);

    const optimisticAttachments = files.length > 0 ? createOptimisticAttachments(files) : [];

    setInput("");

    if (input.trim() && !id) {
      try {
        const newChatId = newIdWithoutPrefix(10);
        router.push(`/chat/${newChatId}`);

        return;
      } catch (error) {
        toast.error("Failed to create chat. Please try again.");
        return;
      }
    }
    try {
      sendMessage({
        text: input,
      });

      clearDraft();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestion = useCallback(
    async (suggestion: string) => {
      setIsSubmitting(true);
      const options = {
        body: {
          chatId: id,
          model: selectedModel,
        },
      };
      sendMessage(
        {
          text: suggestion,
        },
        options
      );
      setIsSubmitting(false);
    },
    [id, selectedModel, sendMessage]
  );

  const handleReload = async () => {
    const options = {
      body: {
        chatId: id,
        model: selectedModel,
      },
    };

    reload(options);
  };

  return (
    <div
      className={cn(
        "@container/main relative flex h-full flex-col items-center justify-end md:justify-center"
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {id ? (
          <Conversation
            key="conversation"
            messages={messages}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReload={handleReload}
            status={status}
          />
        ) : (
          <div
            className="absolute bottom-[60%] mx-auto max-w-[50rem] md:relative md:bottom-auto"
            key="onboarding"
          >
            <h1 className="mb-6 font-medium text-3xl tracking-tight">What&apos;s on your mind?</h1>
          </div>
        )}
      </AnimatePresence>
      <div className={cn("relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl")}>
        <ChatInput
          chatId={id}
          clearDraft={clearDraft}
          files={files}
          getDraft={getDraft}
          hasSuggestions={false}
          isSubmitting={isSubmitting}
          messageCount={messages.length}
          onFileRemove={handleFileRemove}
          onFileUpload={handleFileUpload}
          onSelectModel={handleModelChange}
          onSend={submit}
          onSuggestion={handleSuggestion}
          onValueChange={handleInputChange}
          selectedModel={selectedModel}
          sendMessage={sendMessage}
          status={status}
          stop={stop}
          value={input}
        />
      </div>
    </div>
  );
}
