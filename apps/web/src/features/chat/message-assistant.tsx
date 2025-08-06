import equal from "fast-deep-equal";
import { CheckIcon, CopyIcon, RotateCcw } from "lucide-react";
import { memo } from "react";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/features/chat/kit/message";
import { Reasoning } from "@/features/chat/kit/reasoning";
import { DocumentTool } from "@/features/chat/tools/document-tool";
import { cn } from "@/lib/utils";
import { getSources } from "./get-sources";
import { SearchImages } from "./search-images";

type MessageAssistantProps = {
  isLast?: boolean;
  hasScrollAnchor?: boolean;
  copied?: boolean;
  copyToClipboard?: () => void;
  onReload?: () => void;
  parts?: MessageParts;
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
  const sources = getSources(parts ?? []);
  const isLastStreaming = status === "streaming" && isLast;

  const textParts = parts?.filter((part) => part.type === "text") ?? [];
  const hasTextContent = textParts.length > 0 && textParts.some((part) => part.text?.trim());

  const searchImageResults =
    parts
      ?.filter(
        (part) =>
          part.type === "tool-invocation" &&
          part.toolInvocation?.state === "result" &&
          part.toolInvocation?.toolName === "imageSearch" &&
          part.toolInvocation?.result?.content?.[0]?.type === "images"
      )
      .flatMap((part) =>
        part.type === "tool-invocation" &&
        part.toolInvocation?.state === "result" &&
        part.toolInvocation?.toolName === "imageSearch" &&
        part.toolInvocation?.result?.content?.[0]?.type === "images"
          ? (part.toolInvocation?.result?.content?.[0]?.results ?? [])
          : []
      ) ?? [];

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
              <MessageContent key={partKey} markdown={true} messageRole="assistant">
                {part.text || ""}
              </MessageContent>
            );
          }

          if (part.type === "data-createDocument") {
            return <DocumentTool data={part.data} key={partKey} />;
          }

          if (part.type === "data-updateDocument") {
            return <DocumentTool data={part.data} key={partKey} />;
          }

          // if (part.type === "tool-invocation") {
          //   return <ToolInvocation key={partKey} toolInvocations={[part]} />;
          // }

          // Skip step-start and other part types
          return null;
        })}

        {/* Render search images if any */}
        {searchImageResults.length > 0 && <SearchImages results={searchImageResults} />}

        {/* Render sources if any */}
        {sources && sources.length > 0 && <SourcesList sources={sources} />}

        {/* Render actions if not streaming and has content */}
        {!isLastStreaming && hasTextContent && (
          <MessageActions
            className={cn("-ml-2 flex gap-0 opacity-0 transition-opacity group-hover:opacity-100")}
          >
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
            <MessageAction delayDuration={0} side="bottom" tooltip="Regenerate">
              <button
                aria-label="Regenerate"
                className="flex size-7.5 items-center justify-center rounded-full bg-transparent text-muted-foreground transition hover:bg-accent/60 hover:text-foreground"
                onClick={onReload}
                type="button"
              >
                <RotateCcw className="size-4" />
              </button>
            </MessageAction>
          </MessageActions>
        )}
      </div>
    </Message>
  );
}
export const MessageAssistant = memo(MessageAssistantComponent, (prevProps, nextProps) => {
  // If this is the last message and it's streaming, always re-render
  if (nextProps.isLast && nextProps.status === "streaming") {
    return false;
  }

  if (prevProps.status !== nextProps.status) return false;

  if (prevProps.isLast !== nextProps.isLast) return false;

  // Deep compare parts to catch any changes
  if (!equal(prevProps.parts, nextProps.parts)) return false;

  // Check other props
  if (prevProps.copied !== nextProps.copied) return false;
  if (prevProps.hasScrollAnchor !== nextProps.hasScrollAnchor) return false;

  // Functions are assumed to be stable
  return true;
});
