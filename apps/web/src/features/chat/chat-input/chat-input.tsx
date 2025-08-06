"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { Button } from "@/components/ui/button";

import { ArrowUpIcon, StopIcon } from "@phosphor-icons/react";
import React, { useCallback } from "react";

import { ButtonFileUpload } from "./button-file-upload";
import { ButtonSearch } from "./button-search";
import { FileList } from "./file-list";

import { chatDataPartSchemas, ChatHelpers } from "@/features/chat/types";
import { DraftData, NEW_CHAT_DRAFT_KEY } from "@/features/chat/hooks/use-chat-drafts";
import { useOnMountUnsafe } from "@/hooks/use-on-mount-unsafe";

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
    [isSubmitting, onSend, status, value],
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
                { type: file.type },
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
    [onFileUpload],
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
        <PromptInput className="relative z-10 bg-popover p-0 pt-1 shadow-xs backdrop-blur-xl">
          <FileList files={files} onFileRemove={onFileRemove} />
          <PromptInputTextarea
            placeholder="Ask Cospark"
            onKeyDown={handleKeyDown}
            maxHeight={200}
            value={value}
            onValueChange={(value) => {
              onValueChange(value);
            }}
            disabled={isSubmitting}
            className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
          />
          <PromptInputActions className="mt-5 w-full justify-between px-3 pb-3">
            <div className="flex gap-2">
              <ButtonFileUpload onFileUpload={onFileUpload} model={selectedModel} />
              {/* <ModelSelector
                selectedModelId={selectedModel}
                setSelectedModelId={onSelectModel}
                isUserAuthenticated={isUserAuthenticated}
                className="rounded-full"
              /> */}
              <ButtonSearch isSelected={false} onToggle={() => {}} />
            </div>
            <PromptInputAction tooltip={status === "streaming" ? "Stop" : "Send"}>
              <Button
                size="sm"
                className="size-9 rounded-full transition-all duration-300 ease-out"
                disabled={!value || isSubmitting || isOnlyWhitespace(value)}
                type="button"
                onClick={handleSend}
                aria-label={status === "streaming" ? "Stop" : "Send message"}
              >
                {status === "streaming" ? (
                  <StopIcon className="size-4" />
                ) : (
                  <ArrowUpIcon className="size-4" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}
