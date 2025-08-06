import equal from "fast-deep-equal";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { ChatUIMessage } from "@/features/chat/chat.types";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/features/chat/kit/message";
import { Reasoning } from "@/features/chat/kit/reasoning";
import { cn } from "@/lib/utils";

type MessageAssistantProps = {
  isLast?: boolean;
  hasScrollAnchor?: boolean;
  copied?: boolean;
  copyToClipboard?: () => void;
  onReload?: () => void;
  parts?: ChatUIMessage["parts"];
  status?: "streaming" | "ready" | "submitted" | "error";
};

function MessageAssistantComponent({
  isLast,
  hasScrollAnchor,
  copied,
  copyToClipboard,
  onReload,
  parts,
  status,
}: MessageAssistantProps) {
  const isLastStreaming = status === "streaming" && isLast;

  const textParts = parts?.filter((part) => part.type === "text") ?? [];
  const hasTextContent = textParts.length > 0 && textParts.some((part) => part.text?.trim());

  return (
    <Message
      className={cn(
        "group flex w-full max-w-3xl flex-1 items-start gap-2 px-6 pb-2",
        hasScrollAnchor && "min-h-scroll-anchor"
      )}
    >
      <div className={cn("flex min-w-full flex-col gap-2")}>
        {parts?.map((part, index) => {
          const partKey = `part-${index}`;
          const isLastPart = parts && index === parts.length - 1;
          const isReasoning = isLastStreaming && isLastPart && part.type === "reasoning";

          if (part.type === "reasoning" && part.text) {
            return <Reasoning isReasoning={isReasoning} key={partKey} reasoning={part.text} />;
          }

          if (part.type === "text") {
            return (
              <MessageContent key={partKey} markdown={true}>
                {part.text || ""}
              </MessageContent>
            );
          }

          // if (part.type === "tool-invocation") {
          //   return <ToolInvocation key={partKey} toolInvocations={[part]} />;
          // }

          // Skip step-start and other part types
          return null;
        })}

        {!isLastStreaming && hasTextContent && (
          <MessageActions
            className={cn(
              "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
              isLast && "opacity-100"
            )}
          >
            <MessageAction delayDuration={100} tooltip="Copy">
              <Button className="rounded-full" size="icon" variant="ghost">
                <Copy />
              </Button>
            </MessageAction>
            <MessageAction delayDuration={100} tooltip="Upvote">
              <Button className="rounded-full" size="icon" variant="ghost">
                <ThumbsUp />
              </Button>
            </MessageAction>
            <MessageAction delayDuration={100} tooltip="Downvote">
              <Button className="rounded-full" size="icon" variant="ghost">
                <ThumbsDown />
              </Button>
            </MessageAction>
          </MessageActions>
        )}
      </div>
    </Message>
  );
}
export const MessageAssistant = memo(MessageAssistantComponent, (prevProps, nextProps) => {
  if (nextProps.isLast && nextProps.status === "streaming") {
    return false;
  }

  if (prevProps.status !== nextProps.status) return false;

  if (prevProps.isLast !== nextProps.isLast) return false;

  if (!equal(prevProps.parts, nextProps.parts)) return false;

  if (prevProps.copied !== nextProps.copied) return false;
  if (prevProps.hasScrollAnchor !== nextProps.hasScrollAnchor) return false;

  return true;
});
