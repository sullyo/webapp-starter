import type { UIMessage as MessageType } from "ai";
import equal from "fast-deep-equal";
import { memo, useState } from "react";

import type { ChatUIMessage } from "@/features/chat/chat.types";
import { MessageAssistant } from "./message-assistant";
import { MessageUser } from "./message-user";

type MessageProps = {
  variant: MessageType["role"];
  id: string;
  isLast?: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onReload: () => void;
  hasScrollAnchor?: boolean;
  parts?: ChatUIMessage["parts"];
  status?: "streaming" | "ready" | "submitted" | "error";
};

function MessageComponent({
  variant,
  id,
  isLast,
  onDelete,
  onEdit,
  onReload,
  hasScrollAnchor,
  parts,
  status,
}: MessageProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      parts
        ?.filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("") ?? ""
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 500);
  };

  if (variant === "user") {
    return (
      <MessageUser
        copied={copied}
        copyToClipboard={copyToClipboard}
        hasScrollAnchor={hasScrollAnchor}
        id={id}
        onDelete={onDelete}
        onEdit={onEdit}
        onReload={onReload}
        parts={parts}
      />
    );
  }

  if (variant === "assistant") {
    return (
      <MessageAssistant
        copied={copied}
        copyToClipboard={copyToClipboard}
        hasScrollAnchor={hasScrollAnchor}
        isLast={isLast}
        onReload={onReload}
        parts={parts}
        status={status}
      />
    );
  }

  return null;
}
export const Message = memo(MessageComponent, (prevProps, nextProps) => {
  if (nextProps.isLast && nextProps.status === "streaming") {
    return false;
  }

  if (prevProps.status !== nextProps.status) return false;

  if (prevProps.isLast !== nextProps.isLast) return false;

  if (!equal(prevProps.parts, nextProps.parts)) return false;

  if (prevProps.variant !== nextProps.variant) return false;
  if (prevProps.id !== nextProps.id) return false;
  if (prevProps.hasScrollAnchor !== nextProps.hasScrollAnchor) return false;

  return true;
});
