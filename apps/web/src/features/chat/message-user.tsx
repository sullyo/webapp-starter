"use client";

import type { UIMessage as MessageType } from "ai";
import { CheckIcon, CopyIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogImage,
  MorphingDialogTrigger,
} from "@/components/motion-primitives/morphing-dialog";
import { Button } from "@/components/ui/button";
import {
  MessageAction,
  MessageActions,
  Message as MessageContainer,
  MessageContent,
} from "@/features/chat/kit/message";
import { cn } from "@/lib/utils";

const getTextFromDataUrl = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1];
  return base64;
};

export type MessageUserProps = {
  hasScrollAnchor?: boolean;
  parts?: MessageType["parts"];
  copied: boolean;
  copyToClipboard: () => void;
  onEdit: (id: string, newText: string) => void;
  onReload: () => void;
  onDelete: (id: string) => void;
  id: string;
};

export function MessageUser({
  hasScrollAnchor,
  parts,
  copied,
  copyToClipboard,
  onEdit,
  onReload,
  onDelete,
  id,
}: MessageUserProps) {
  const [editInput, setEditInput] = useState(
    parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("") ?? ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditInput(
      parts
        ?.filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("") ?? ""
    );
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit(id, editInput);
    }
    onReload();
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(id);
  };

  // Extract file parts
  const fileParts = parts?.filter((part) => part.type === "file") ?? [];

  // Extract text parts
  const textParts = parts?.filter((part) => part.type === "text") ?? [];
  const hasTextContent = textParts.length > 0 && textParts.some((part) => part.text?.trim());

  return (
    <MessageContainer
      className={cn(
        "group flex w-full max-w-3xl flex-col items-end gap-0.5 px-6 pb-2",
        hasScrollAnchor && "min-h-scroll-anchor"
      )}
    >
      {/* Render file attachments */}
      {fileParts.map((part, index) => {
        if (part.type !== "file") return null;

        return (
          <div className="flex flex-row gap-2" key={`file-${index}`}>
            {part.mediaType?.startsWith("image") ? (
              <MorphingDialog
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 18,
                  mass: 0.3,
                }}
              >
                <MorphingDialogTrigger className="z-10">
                  <Image
                    alt={part.filename || "Attachment"}
                    className="mb-1 w-40 rounded-md"
                    height={120}
                    src={part.url}
                    width={160}
                  />
                </MorphingDialogTrigger>
                <MorphingDialogContainer>
                  <MorphingDialogContent className="relative rounded-lg">
                    <MorphingDialogImage
                      alt={part.filename || ""}
                      className="max-h-[90vh] max-w-[90vw] object-contain"
                      src={part.url}
                    />
                  </MorphingDialogContent>
                  <MorphingDialogClose className="text-primary" />
                </MorphingDialogContainer>
              </MorphingDialog>
            ) : part.mediaType?.startsWith("text") ? (
              <div className="mb-3 h-24 w-40 overflow-hidden rounded-md border p-2 text-primary text-xs">
                {getTextFromDataUrl(part.url)}
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Render text content */}
      {isEditing ? (
        <div
          className="relative flex min-w-[180px] flex-col gap-2 rounded-3xl bg-accent px-5 py-2.5"
          style={{
            width: contentRef.current?.offsetWidth,
          }}
        >
          <textarea
            className="w-full resize-none bg-transparent outline-none"
            onChange={(e) => setEditInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") {
                handleEditCancel();
              }
            }}
            value={editInput}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={handleEditCancel} size="sm" variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm">
              Save
            </Button>
          </div>
        </div>
      ) : (
        hasTextContent && (
          <MessageContent
            className="relative max-w-[70%] rounded-4xl bg-accent px-4 py-2"
            markdown={false}
            ref={contentRef}
          >
            {textParts.map((part) => part.text).join("")}
          </MessageContent>
        )
      )}

      {/* Render actions if has text content */}
      {hasTextContent && (
        <MessageActions className="flex gap-0 opacity-0 transition-opacity duration-0 group-hover:opacity-100">
          <MessageAction side="bottom" tooltip={copied ? "Copied!" : "Copy text"}>
            <button
              aria-label="Copy text"
              className="flex size-7.5 items-center justify-center rounded-full bg-transparent text-muted-foreground transition hover:bg-accent/60 hover:text-foreground"
              onClick={copyToClipboard}
              type="button"
            >
              {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            </button>
          </MessageAction>
          {/* @todo: add when ready */}
          {/* <MessageAction
            tooltip={isEditing ? "Save" : "Edit"}
            side="bottom"
            delayDuration={0}
          >
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent transition"
              aria-label="Edit"
              onClick={() => setIsEditing(!isEditing)}
              type="button"
            >
              <PencilSimple className="size-4" />
            </button>
          </MessageAction> */}
          {/* <MessageAction tooltip="Delete" side="bottom">
            <button
              className="flex size-7.5 items-center justify-center rounded-full bg-transparent text-muted-foreground transition hover:bg-accent/60 hover:text-foreground"
              aria-label="Delete"
              onClick={handleDelete}
              type="button"
            >
              <TrashIcon className="size-4" />
            </button>
          </MessageAction> */}
        </MessageActions>
      )}
    </MessageContainer>
  );
}
