import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatRequestOptions, Message } from "ai";
import equal from "fast-deep-equal";
import { memo, useRef, useState } from "react";
import { ChatContainer } from "../../features/chat/kit/chat-container";
import { PreviewMessage, ThinkingMessage } from "./message";

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers["status"];
  messages: Message[];
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isBlockVisible: boolean;
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  return (
    <ChatContainer autoScroll={autoScroll} className="flex-1 space-y-4 p-4" ref={chatContainerRef}>
      {messages.map((message, index) => (
        <PreviewMessage
          chatId={chatId}
          isLoading={status === "streaming" && messages.length - 1 === index}
          isReadonly={isReadonly}
          key={message.id}
          message={message}
          reload={reload}
          setMessages={setMessages}
        />
      ))}

      {status === "submitted" && messages.length > 0 && messages.at(-1)?.role === "user" && (
        <ThinkingMessage />
      )}
    </ChatContainer>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isBlockVisible && nextProps.isBlockVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});
