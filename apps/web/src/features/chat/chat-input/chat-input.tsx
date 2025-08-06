/** biome-ignore-all lint/performance/useTopLevelRegex: <explanation> */
"use client";

import { ArrowUp } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { ChatHelpers } from "@/features/chat/chat.types";
import { type DraftData, NEW_CHAT_DRAFT_KEY } from "@/features/chat/hooks/use-chat-drafts";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/features/chat/kit/prompt-input";
import { useOnMountUnsafe } from "@/hooks/use-on-mount-unsafe";
import { ButtonFileUpload } from "./button-file-upload";
import { ButtonSearch } from "./button-search";
import { FileList } from "./file-list";

type ChatInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  isSubmitting?: boolean;
  hasMessages?: boolean;
  files: File[];
  onFileUpload: (files: File[]) => void;
  onFileRemove: (file: File) => void;
  onSuggestion: (suggestion: string) => void;
  hasSuggestions?: boolean;
  onSelectModel: (model: string) => void;
  selectedModel: string;
  stop: () => void;
  status?: "submitted" | "streaming" | "ready" | "error";
  chatId: string | null;
  onSearchToggle?: (enabled: boolean, agentId: string | null) => void;
  sendMessage: ChatHelpers["sendMessage"];
  messageCount: number;
  clearDraft: (draftId?: string) => void;
  getDraft: (draftId?: string) => DraftData | null;
};

export function ChatInput({
  value,
  onValueChange,
  onSend,
  isSubmitting,
  files,
  onFileUpload,
  onFileRemove,
  onSuggestion,
  hasSuggestions,
  onSelectModel,
  selectedModel,
  stop,
  status,
  onSearchToggle,
  clearDraft,
  getDraft,
  sendMessage,
  messageCount,
  chatId,
}: ChatInputProps) {
  const isOnlyWhitespace = (text: string) => !/[^\s]/.test(text);

  const handleSend = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (status === "streaming") {
      stop();
      return;
    }

    onSend();
  }, [isSubmitting, onSend, status, stop]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // First process agent command related key handling

      if (isSubmitting) {
        e.preventDefault();
        return;
      }

      if (e.key === "Enter" && status === "streaming") {
        e.preventDefault();
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        if (isOnlyWhitespace(value)) {
          return;
        }

        e.preventDefault();
        onSend();
      }
    },
    [isSubmitting, onSend, status, value]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const hasImageContent = Array.from(items).some((item) => item.type.startsWith("image/"));

      if (hasImageContent) {
        e.preventDefault();
        return;
      }

      if (hasImageContent) {
        const imageFiles: File[] = [];

        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              const newFile = new File(
                [file],
                `pasted-image-${Date.now()}.${file.type.split("/")[1]}`,
                { type: file.type }
              );
              imageFiles.push(newFile);
            }
          }
        }

        if (imageFiles.length > 0) {
          onFileUpload(imageFiles);
        }
      }
    },
    [onFileUpload]
  );

  useOnMountUnsafe(() => {
    if (getDraft(NEW_CHAT_DRAFT_KEY)?.message?.length && messageCount === 0 && chatId) {
      const finalValue = getDraft(NEW_CHAT_DRAFT_KEY)?.message || "";
      clearDraft(NEW_CHAT_DRAFT_KEY);

      sendMessage({
        text: finalValue,
      });
    }
  });

  return (
    <div className="relative flex w-full flex-col gap-4">
      <div className="relative order-2 px-2 pb-3 sm:pb-4 md:order-1">
        <PromptInput
          className="relative z-10 w-full rounded-3xl border border-input bg-popover p-0 pt-1 shadow-xs"
          isLoading={status !== "ready"}
          onSubmit={handleSend}
          onValueChange={onValueChange}
          value={value}
        >
          <FileList files={files} onFileRemove={onFileRemove} />
          <PromptInputTextarea
            className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
            placeholder="Ask anything..."
          />
          <PromptInputActions className="mt-5 w-full justify-between px-3 pb-3">
            <div className="flex gap-2">
              <ButtonFileUpload model={selectedModel} onFileUpload={onFileUpload} />
              {/* <ModelSelector
                selectedModelId={selectedModel}
                setSelectedModelId={onSelectModel}
                isUserAuthenticated={isUserAuthenticated}
                className="rounded-full"
              /> */}
              <ButtonSearch isSelected={false} onToggle={() => {}} />
            </div>
            <PromptInputActions className="mt-3 flex w-full items-center justify-between gap-2 p-2">
              <div />
              <div className="flex items-center gap-2">
                <Button
                  className="size-9 rounded-full"
                  disabled={!value.trim() || (status !== "ready" && status !== "error")}
                  onClick={handleSend}
                  size="icon"
                >
                  {status === "ready" || status === "error" ? (
                    <ArrowUp size={18} />
                  ) : (
                    <span className="size-3 rounded-xs bg-white" />
                  )}
                </Button>
              </div>
            </PromptInputActions>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}
